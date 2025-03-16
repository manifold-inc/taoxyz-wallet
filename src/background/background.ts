import { MESSAGE_TYPES, ERROR_TYPES } from "../types/messages";
import type {
  StoredRequest,
  StoredSignRequest,
  DappMessage,
  ExtensionMessage,
  MessagePayloadMap,
  ResponseMessage,
} from "../types/messages";
import { generateId } from "../utils/utils";

// This is Service Worker Code.

const getStoredRequest = async (key: string): Promise<StoredRequest> => {
  const result = await chrome.storage.local.get(key);
  if (!result[key]) {
    throw new Error(`[Background] No stored ${key} found`);
  }
  return result[key];
};

const storeRequest = async (
  key: string,
  data: StoredRequest | StoredSignRequest
): Promise<void> => {
  await chrome.storage.local.set({ [key]: data });
  console.log(`[Background] Stored ${key}:`, data);
};

const cleanupRequest = async (key: string): Promise<void> => {
  await chrome.storage.local.remove(key);
  console.log(`[Background] Cleaned up ${key}`);
};

const sendMessageToTab = async <T extends keyof MessagePayloadMap>(
  tabId: number,
  message: ExtensionMessage & { type: T }
): Promise<void> => {
  try {
    await chrome.tabs.sendMessage(tabId, message);
    console.log(
      `[Background] Response sent to tab ${tabId}, message: ${JSON.stringify(
        message
      )}`
    );
  } catch (error) {
    console.error(
      `[Background] Failed to send message to tab ${tabId}:`,
      error
    );
    throw error;
  }
};

const sendErrorResponse = (
  sendResponse: (response: ResponseMessage) => void,
  error: string,
  details?: unknown
) => {
  console.error(`[Background] ${error}`, details || "");
  sendResponse({ success: false, error, details });
};

const openPopup = async (route: string): Promise<chrome.windows.Window> => {
  return await chrome.windows.create({
    url: chrome.runtime.getURL(`index.html#/${route}`),
    type: "popup",
    width: 400,
    height: 600,
  });
};

async function handleConnectRequest(
  message: DappMessage & { type: typeof MESSAGE_TYPES.CONNECT_REQUEST },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: { success: boolean; error?: string }) => void
) {
  if (!sender.tab?.id) {
    sendErrorResponse(sendResponse, ERROR_TYPES.NO_TAB);
    return;
  }

  if (!message.payload.origin) {
    sendErrorResponse(sendResponse, ERROR_TYPES.NO_ORIGIN);
    return;
  }

  try {
    const requestId = generateId();
    await storeRequest("connectRequest", {
      origin: message.payload.origin,
      requestId: requestId.toString(),
      tabId: sender.tab.id,
    });

    await openPopup("connect");
    sendResponse({ success: true });
    console.log("[Background] New connect request:", requestId);
  } catch (error) {
    console.error("[Background] Error handling connect request:", error);
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

async function handleConnectResponse(
  message: ExtensionMessage & { type: typeof MESSAGE_TYPES.CONNECT_RESPONSE },
  sendResponse: (response: { success: boolean; error?: string }) => void
) {
  const request = await getStoredRequest("connectRequest");
  if (!request) {
    sendErrorResponse(sendResponse, ERROR_TYPES.NO_REQUEST);
    return;
  }

  if (!request.tabId) {
    sendErrorResponse(sendResponse, ERROR_TYPES.NO_TAB);
    return;
  }

  try {
    await sendMessageToTab(request.tabId, {
      type: MESSAGE_TYPES.CONNECT_RESPONSE,
      payload: message.payload,
    });

    await cleanupRequest("connectRequest");
    sendResponse({ success: true });
    console.log("[Background] Connect response handled successfully");
  } catch (error) {
    console.error("[Background] Error handling connect response:", error);
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

async function handleSignRequest(
  message: DappMessage & { type: typeof MESSAGE_TYPES.SIGN_REQUEST },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ResponseMessage) => void
) {
  if (!sender.tab?.id) {
    sendErrorResponse(sendResponse, ERROR_TYPES.NO_TAB);
    return;
  }

  if (!message.payload.origin) {
    sendErrorResponse(sendResponse, ERROR_TYPES.NO_ORIGIN);
    return;
  }

  try {
    const origin = message.payload.origin;
    const address = message.payload.address;

    const permissionCheck = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.AUTHENTICATE,
      payload: { address, origin, requestId: message.payload.id },
    });

    if (!permissionCheck.approved) {
      console.log(
        `[Background] Permission denied for ${origin} to sign with ${address}`
      );
      await sendMessageToTab(sender.tab.id, {
        type: MESSAGE_TYPES.SIGN_RESPONSE,
        payload: { id: message.payload.id, approved: false },
      });
      sendErrorResponse(sendResponse, ERROR_TYPES.PERMISSION_DENIED);
      return;
    }

    const requestId = generateId();
    await storeRequest("signRequest", {
      address,
      data: message.payload.data,
      origin,
      requestId: requestId.toString(),
      tabId: sender.tab.id,
    });

    await openPopup("sign");
    sendResponse({ success: true });
    console.log("[Background] Sign request initiated:", {
      requestId,
      origin,
      tabId: sender.tab.id,
    });
  } catch (error) {
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

async function handleSignResponse(
  message: ExtensionMessage & { type: typeof MESSAGE_TYPES.SIGN_RESPONSE },
  sendResponse: (response: { success: boolean; error?: string }) => void
) {
  const request = await getStoredRequest("signRequest");
  if (!request.tabId) {
    sendErrorResponse(sendResponse, ERROR_TYPES.NO_TAB);
    return;
  }

  try {
    await sendMessageToTab(request.tabId, {
      type: MESSAGE_TYPES.SIGN_RESPONSE,
      payload: {
        id: parseInt(request.requestId),
        signature: message.payload.signature,
        approved: message.payload.approved,
      },
    });

    await cleanupRequest("signRequest");
    sendResponse({ success: true });
    console.log("[Background] Sign response handled successfully");
  } catch (error) {
    console.error("[Background] Error handling sign response:", error);
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

async function handleAccountsLocked(
  _message: ExtensionMessage & { type: typeof MESSAGE_TYPES.ACCOUNTS_LOCKED },
  sendResponse: (response: { success: boolean; error?: string }) => void
) {
  try {
    console.log("[Background] Accounts locked");
    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.ACCOUNTS_LOCKED,
    });
    sendResponse({ success: true });
  } catch (error) {
    console.error("[Background] Error handling accounts locked:", error);
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

async function handleStartLockTimer(
  message: ExtensionMessage & { type: typeof MESSAGE_TYPES.START_LOCK_TIMER },
  sendResponse: (response: { success: boolean; error?: string }) => void
) {
  try {
    chrome.alarms.create("lockTimer", { delayInMinutes: 15 });
    console.log("[Background] Lock timer started");
    sendResponse({ success: true });
  } catch (error) {
    console.error("[Background] Error starting lock timer:", error);
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

async function handleClearLockTimer(
  message: ExtensionMessage & { type: typeof MESSAGE_TYPES.CLEAR_LOCK_TIMER },
  sendResponse: (response: { success: boolean; error?: string }) => void
) {
  try {
    chrome.alarms.clear("lockTimer");
    sendResponse({ success: true });
  } catch (error) {
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Message received:", message);

  switch (message.type) {
    case MESSAGE_TYPES.CONNECT_REQUEST:
      handleConnectRequest(message, sender, sendResponse);
      break;

    case MESSAGE_TYPES.CONNECT_RESPONSE:
      handleConnectResponse(message, sendResponse);
      break;

    case MESSAGE_TYPES.SIGN_REQUEST:
      handleSignRequest(message, sender, sendResponse);
      break;

    case MESSAGE_TYPES.SIGN_RESPONSE:
      handleSignResponse(message, sendResponse);
      break;

    case MESSAGE_TYPES.ACCOUNTS_LOCKED:
      handleAccountsLocked(message, sendResponse);
      break;

    case MESSAGE_TYPES.START_LOCK_TIMER:
      handleStartLockTimer(message, sendResponse);
      break;

    case MESSAGE_TYPES.CLEAR_LOCK_TIMER:
      handleClearLockTimer(message, sendResponse);
      break;

    default:
      console.log("[Background] Unknown message type:", message.type);
      sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR);
  }

  return true;
});

// When timer goes up, lock all accounts
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "lockTimer") {
    console.log("[Background] Lock timer finished");
    chrome.storage.local.set({ accountLocked: true }, () => {
      console.log("[Background] Set accountLocked to true");
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.ACCOUNTS_LOCKED,
      });
    });
  }
});

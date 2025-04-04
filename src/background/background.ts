import { MESSAGE_TYPES, ERROR_TYPES } from "../types/messages";
import type {
  StoredRequest,
  StoredSignRequest,
  DappMessage,
  ExtensionMessage,
  MessagePayloadMap,
  ResponseMessage,
  PopupInfo,
} from "../types/messages";
import { generateId } from "../utils/utils";

const activePopups = new Map<number, PopupInfo>();

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
};

const cleanupRequest = async (key: string): Promise<void> => {
  await chrome.storage.local.remove(key);
};

const sendMessageToTab = async <T extends keyof MessagePayloadMap>(
  tabId: number,
  message: ExtensionMessage & { type: T }
): Promise<void> => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab) {
      console.error(`[Background] Tab ${tabId} no longer exists`);
      throw new Error(ERROR_TYPES.NO_TAB);
    }

    await chrome.tabs.sendMessage(tabId, message);
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

const rejectRequest = async (popupInfo: PopupInfo): Promise<void> => {
  let storedRequest = null;
  switch (popupInfo.route) {
    case "connect":
      storedRequest = await getStoredRequest("connectRequest");
      if (storedRequest) {
        await sendMessageToTab(storedRequest.tabId, {
          type: MESSAGE_TYPES.CONNECT_RESPONSE,
          payload: {
            approved: false,
            wallets: [],
          },
        });
        await cleanupRequest("connectRequest");
      }
      break;
    case "sign":
      storedRequest = await getStoredRequest("signRequest");
      if (storedRequest) {
        await sendMessageToTab(storedRequest.tabId, {
          type: MESSAGE_TYPES.SIGN_RESPONSE,
          payload: {
            id: parseInt(storedRequest.requestId),
            approved: false,
          },
        });
        await cleanupRequest("signRequest");
      }
      break;
    default:
      console.log("[Background] Unknown Route:", popupInfo.route);
      break;
  }
};

const openPopup = async (
  route: string,
  origin: string
): Promise<chrome.windows.Window> => {
  const popup = await chrome.windows.create({
    url: chrome.runtime.getURL(`index.html#/${route}`),
    type: "popup",
    width: 366,
    height: 628,
  });

  if (popup.id) {
    activePopups.set(popup.id, { route, origin });
  }

  return popup;
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
    const existingPopupId = Array.from(activePopups.entries()).find(
      ([_, popup]) => popup.origin === message.payload.origin
    )?.[0];

    if (existingPopupId) {
      const existingPopup = activePopups.get(existingPopupId);
      if (existingPopup) {
        await chrome.windows.remove(existingPopupId);
        activePopups.delete(existingPopupId);
        await rejectRequest(existingPopup);
      }
    }

    const requestId = generateId();
    await storeRequest("connectRequest", {
      origin: message.payload.origin,
      requestId: requestId.toString(),
      tabId: sender.tab.id,
    });

    await openPopup("connect", message.payload.origin);
    sendResponse({ success: true });
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

    const storageKey = `permissions_${address}`;
    const result = await chrome.storage.local.get(storageKey);
    const permissions = result[storageKey]?.permissions || {};
    const approved = permissions[origin] === true;

    if (!approved) {
      await sendMessageToTab(sender.tab.id, {
        type: MESSAGE_TYPES.SIGN_RESPONSE,
        payload: { id: message.payload.id, approved: false },
      });
      sendErrorResponse(sendResponse, ERROR_TYPES.PERMISSION_DENIED);
      return;
    }

    const existingPopupId = Array.from(activePopups.entries()).find(
      ([_, popup]) => popup.origin === origin
    )?.[0];

    if (existingPopupId) {
      const existingPopup = activePopups.get(existingPopupId);
      if (existingPopup) {
        await chrome.windows.remove(existingPopupId);
        activePopups.delete(existingPopupId);
        await rejectRequest(existingPopup);
      }
    }

    const requestId = generateId();
    await storeRequest("signRequest", {
      address,
      data: message.payload.data,
      origin,
      requestId: requestId.toString(),
      tabId: sender.tab.id,
    });

    await openPopup("sign", origin);
    sendResponse({ success: true });
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
  } catch (error) {
    console.error("[Background] Error handling sign response:", error);
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

async function handleWalletsLocked(
  _message: ExtensionMessage & { type: typeof MESSAGE_TYPES.WALLETS_LOCKED },
  sendResponse: (response: { success: boolean; error?: string }) => void
) {
  try {
    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.WALLETS_LOCKED,
    });
    sendResponse({ success: true });
  } catch (error) {
    console.error("[Background] Error handling wallets locked:", error);
    sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
  }
}

async function handleStartLockTimer(
  message: ExtensionMessage & { type: typeof MESSAGE_TYPES.START_LOCK_TIMER },
  sendResponse: (response: { success: boolean; error?: string }) => void
) {
  try {
    chrome.alarms.create("lockTimer", { delayInMinutes: 15 });
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

    case MESSAGE_TYPES.WALLETS_LOCKED:
      handleWalletsLocked(message, sendResponse);
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
    chrome.storage.local.set({ walletLocked: true }, () => {
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.WALLETS_LOCKED,
      });
    });
  }
});

// Popup close handler
chrome.windows.onRemoved.addListener(async (windowId) => {
  const popupInfo = activePopups.get(windowId);
  if (!popupInfo) return;
  activePopups.delete(windowId);

  try {
    const storageKey = `${popupInfo.route}Request`;
    await getStoredRequest(storageKey);
    await rejectRequest(popupInfo);
  } catch {
    console.log("[Background] Request Already Handled");
  }
});

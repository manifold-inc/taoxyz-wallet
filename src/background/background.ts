import type { SignerPayloadJSON } from "@polkadot/types/types";

interface StoredRequest {
  tabId: number;
  origin: string;
  requestId: string;
}

interface StoredSignRequest extends StoredRequest {
  address: string;
  data: SignerPayloadJSON;
}

interface RequestMessage {
  type: string;
  payload: {
    origin?: string;
    id?: number;
    address?: string;
    data?: any;
  };
}

interface ResponseMessage {
  type: string;
  payload: {
    id: number;
    signature?: string;
    accounts?: any[];
    approved?: boolean;
  };
}

const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

const getStoredRequest = async (key: string): Promise<StoredRequest | null> => {
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
};

const storeRequest = async (
  key: string,
  data: StoredRequest | StoredSignRequest
): Promise<void> => {
  await chrome.storage.local.set({ [key]: data });
  console.log(`[Background] Stored ${key}:`, data);
};

const sendMessageToTab = async (
  tabId: number,
  message: ResponseMessage
): Promise<void> => {
  try {
    await chrome.tabs.sendMessage(tabId, message);
    console.log(`[Background] Response sent to tab ${tabId}`);
  } catch (error) {
    console.error(
      `[Background] Failed to send message to tab ${tabId}:`,
      error
    );
    throw error;
  }
};

const cleanupRequest = async (key: string): Promise<void> => {
  await chrome.storage.local.remove(key);
  console.log(`[Background] Cleaned up ${key}`);
};

const openPopup = async (route: string): Promise<chrome.windows.Window> => {
  return await chrome.windows.create({
    url: chrome.runtime.getURL(`index.html#/${route}`),
    type: "popup",
    width: 400,
    height: 600,
  });
};

// Request handlers
async function handleConnectRequest(
  message: RequestMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  try {
    const requestId = generateId();
    console.log("[Background] New connect request:", requestId);

    await storeRequest("connectRequest", {
      origin: message.payload.origin || "",
      requestId: requestId.toString(),
      tabId: sender.tab?.id || 0,
    });

    await openPopup("connect");
    sendResponse({ success: true });
  } catch (error) {
    console.error("[Background] Error handling connect request:", error);
    sendResponse({ success: false, error: "Failed to process request" });
  }
}

async function handleConnectResponse(
  message: ResponseMessage,
  sendResponse: (response: any) => void
) {
  try {
    const request = await getStoredRequest("connectRequest");

    if (!request) {
      console.error("[Background] No stored connect request found");
      sendResponse({ success: false, error: "No pending request" });
      return;
    }

    if (request.tabId) {
      await sendMessageToTab(request.tabId, {
        type: "ext(connectResponse)",
        payload: message.payload,
      });
    }

    await cleanupRequest("connectRequest");
    sendResponse({ success: true });

    console.log("[Background] Connect response handled successfully");
  } catch (error) {
    console.error("[Background] Error handling connect response:", error);
    sendResponse({ success: false, error: "Failed to process response" });
  }
}

async function handleSignRequest(
  message: RequestMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  try {
    const requestId = generateId();
    console.log("[Background] New sign request:", requestId);

    await storeRequest("signRequest", {
      address: message.payload.address || "",
      data: message.payload.data,
      origin: sender.origin || sender.url || "",
      requestId: requestId.toString(),
      tabId: sender.tab?.id || 0,
    });

    await openPopup("sign");
    sendResponse({ success: true });
  } catch (error) {
    console.error("[Background] Error handling sign request:", error);
    sendResponse({ success: false, error: "Failed to process request" });
  }
}

async function handleSignResponse(
  message: ResponseMessage,
  sendResponse: (response: any) => void
) {
  try {
    const request = await getStoredRequest("signRequest");
    if (!request?.tabId) {
      throw new Error("Invalid request");
    }

    await sendMessageToTab(request.tabId, {
      type: "ext(signResponse)",
      payload: {
        id: parseInt(request.requestId),
        signature: message.payload.signature,
      },
    });

    await cleanupRequest("signRequest");
    sendResponse({ success: true });
  } catch (error) {
    console.error("[Background] Error handling sign response:", error);
    sendResponse({ success: false });
  }
}

// Main message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Message received:", message);

  switch (message.type) {
    case "dapp(connectRequest)":
      handleConnectRequest(message, sender, sendResponse);
      break;

    case "ext(connectResponse)":
      handleConnectResponse(message, sendResponse);
      break;

    case "dapp(signRequest)":
      handleSignRequest(message, sender, sendResponse);
      break;

    case "ext(signResponse)":
      handleSignResponse(message, sendResponse);
      break;

    default:
      console.log("[Background] Unknown message type:", message.type);
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return true;
});

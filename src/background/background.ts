import { BittensorService } from "./services/bittensor";
import { MessageHandler } from "./handlers/messages";

// Potentially Refactor this to handle messages from external dapps and move functionality of querying the RPC to the rpcapi.ts

let isInitialized = false;

const initializeOnce = async () => {
  if (isInitialized) return;
  isInitialized = true;

  const bittensor = new BittensorService();
  const messageHandler = new MessageHandler();

  messageHandler.registerHandler("ext(getBalance)", async (payload: any) => {
    const balance = await bittensor.getBalance(payload.address);
    return balance;
  });

  messageHandler.registerHandler("ext(getSubnets)", async () => {
    const subnets = await bittensor.getSubnets();
    return subnets;
  });

  messageHandler.registerHandler("ext(getValidators)", async (payload: any) => {
    const validators = await bittensor.getValidators(payload.subnetId);
    return validators;
  });

  setupMessageListeners(messageHandler);
};

const setupMessageListeners = (messageHandler: MessageHandler) => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[Background] Message received:", message);

    if (message.type === "AUTHORIZATION_REQUEST") {
      const requestId = Math.random().toString(36).slice(2);
      console.log("[Background] Creating request with ID:", requestId);

      // Store request info
      chrome.storage.local.set({
        pendingRequest: {
          origin: message.payload.origin,
          requestId,
          tabId: sender.tab?.id,
        },
      });

      // Open popup and wait for user interaction
      chrome.windows.create({
        url: chrome.runtime.getURL("index.html#/connect"),
        type: "popup",
        width: 400,
        height: 600,
      });

      return true;
    }

    // Handle response from popup
    if (message.type === "AUTHORIZATION_RESPONSE") {
      chrome.storage.local.get(["pendingRequest"], (result) => {
        const { tabId } = result.pendingRequest;
        if (tabId) {
          chrome.tabs.sendMessage(tabId, {
            type: "AUTHORIZATION_RESPONSE",
            payload: message.payload,
          });
        }
      });
    }

    messageHandler
      .handleMessage(message)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse(error));
    return true; // Keep the message channel open for sendResponse
  });
};

chrome.runtime.onInstalled.addListener(initializeOnce);
chrome.runtime.onStartup.addListener(initializeOnce);

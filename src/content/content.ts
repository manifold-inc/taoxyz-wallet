import type {
  DappMessage,
  ExtensionMessage,
  ResponseMessage,
} from "../types/messages";
import { MESSAGE_TYPES, ERROR_TYPES } from "../types/messages";

const script = document.createElement("script");
script.src = chrome.runtime.getURL("content/inject.js");
script.type = "module";
(document.head || document.documentElement).appendChild(script);

const handleError = (error: Error, context: string) => {
  console.error(`[Content] ${context}:`, error.message);
  return { success: false, error: error.message } as ResponseMessage;
};

// Listens for messages from the dApp and forwards them to the background service worker
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.data.source?.startsWith("react-devtools")) return;

  console.log("[Content] Received message:", event.data);
  const message = event.data;

  if (!message || typeof message !== "object") {
    handleError(
      new Error(ERROR_TYPES.INVALID_MESSAGE),
      "Message is not an object"
    );
    return;
  }

  if (!message.type || typeof message.type !== "string") {
    handleError(
      new Error(ERROR_TYPES.INVALID_MESSAGE),
      "Invalid message from dApp"
    );
    return;
  }

  if (
    message.type === MESSAGE_TYPES.CONNECT_REQUEST ||
    message.type === MESSAGE_TYPES.SIGN_REQUEST
  ) {
    chrome.runtime
      .sendMessage(message as DappMessage)
      .then((response: ResponseMessage) => {
        if (!response.success) {
          handleError(
            new Error(ERROR_TYPES.UNKNOWN_ERROR),
            "Error from background"
          );
          return;
        }
      })
      .catch((error) => handleError(error, ERROR_TYPES.UNKNOWN_ERROR));
  }
});

// Forwards messages from the background to the dApp
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    if (sender.id === chrome.runtime.id) {
      if (
        message.type !== MESSAGE_TYPES.CONNECT_RESPONSE &&
        message.type !== MESSAGE_TYPES.SIGN_RESPONSE
      ) {
        handleError(
          new Error(ERROR_TYPES.INVALID_MESSAGE),
          "Invalid message from background"
        );
        return true;
      }

      console.log("[Content] Forwarding background response to dApp:", message);
      window.postMessage(message, window.location.origin);
      sendResponse();
    }
    return true;
  }
);

export {};

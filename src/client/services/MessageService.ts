import { KeyringService } from "./KeyringService";
import { MESSAGE_TYPES, ERROR_TYPES } from "../../types/messages";
import type { ResponseMessage, ExtensionMessage } from "../../types/messages";

const sendErrorResponse = (
  sendResponse: (response: ResponseMessage) => void,
  error: string,
  details?: unknown
) => {
  console.error(`[MessageHandler] ${error}`, details || "");
  sendResponse({ success: false, error, details });
};

// Potentially sendMessage() Refactor

const MessageService = {
  async sendAccountsLockedMessage() {
    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.ACCOUNTS_LOCKED,
    });
  },

  async sendStartLockTimer() {
    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.START_LOCK_TIMER,
    });
  },

  async sendClearLockTimer() {
    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.CLEAR_LOCK_TIMER,
    });
  },

  async handleLockMessage(
    _message: ExtensionMessage & { type: typeof MESSAGE_TYPES.ACCOUNTS_LOCKED },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseMessage) => void
  ) {
    try {
      await chrome.storage.local.set({ walletLocked: true });
      KeyringService.lockAll();
      window.location.reload();
      sendResponse({ success: true });
    } catch (error) {
      console.error("[MessageHandler] Error handling accounts locked:", error);
      sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
    }
    return true;
  },

  setupMessageListeners() {
    const messageListener = (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: ResponseMessage | { approved: boolean }) => void
    ) => {
      if (!message || !message.type) {
        sendErrorResponse(sendResponse, ERROR_TYPES.INVALID_MESSAGE);
        return true;
      }

      switch (message.type) {
        case MESSAGE_TYPES.ACCOUNTS_LOCKED:
          return this.handleLockMessage(
            message as ExtensionMessage & {
              type: typeof MESSAGE_TYPES.ACCOUNTS_LOCKED;
            },
            sender,
            sendResponse as (response: ResponseMessage) => void
          );

        default:
          console.log("[MessageHandler] Unknown message type:", message.type);
          sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR);
          return true;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  },
};

export default MessageService;

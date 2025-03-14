import { KeyringService } from "./KeyringService";
import { MESSAGE_TYPES, ERROR_TYPES } from "../../types/messages";
import type { ResponseMessage, ExtensionMessage } from "../../types/messages";
import type { Permissions } from "../../types/client";

const sendErrorResponse = (
  sendResponse: (response: ResponseMessage) => void,
  error: string,
  details?: unknown
) => {
  console.error(`[MessageHandler] ${error}`, details || "");
  sendResponse({ success: false, error, details });
};

const MessageService = {
  async sendAccountsLockedMessage(reason: string) {
    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.ACCOUNTS_LOCKED,
      payload: {
        reason,
      },
    });
  },

  async handleAuthMessage(
    message: ExtensionMessage & { type: typeof MESSAGE_TYPES.AUTHENTICATE },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: { approved: boolean }) => void
  ) {
    try {
      const { address, origin } = message.payload;
      console.log(
        `[MessageHandler] Checking permission for ${origin} to access ${address}`
      );

      const account = await KeyringService.getAccount(address);
      const permissions =
        (account.meta.websitePermissions as Permissions) || {};
      const approved = permissions[origin] === true;

      sendResponse({ approved });
    } catch (error) {
      console.error("[MessageHandler] Error checking permissions:", error);
      sendResponse({ approved: false });
    }
    return true;
  },

  handleLockMessage(
    _message: ExtensionMessage & { type: typeof MESSAGE_TYPES.ACCOUNTS_LOCKED },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseMessage) => void
  ) {
    try {
      localStorage.setItem("accountLocked", "true");
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
        case MESSAGE_TYPES.AUTHENTICATE:
          return this.handleAuthMessage(
            message as ExtensionMessage & {
              type: typeof MESSAGE_TYPES.AUTHENTICATE;
            },
            sender,
            sendResponse as (response: { approved: boolean }) => void
          );

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

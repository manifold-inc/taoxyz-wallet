import { ERROR_TYPES, MESSAGE_TYPES } from '../../types/messages';
import type { DappMessage, ExtensionMessage, ResponseMessage } from '../../types/messages';
import { KeyringService } from './KeyringService';

const sendErrorResponse = (
  sendResponse: (response: ResponseMessage) => void,
  error: string,
  details?: unknown
) => {
  console.error(`[MessageHandler] ${error}`, details || '');
  sendResponse({ success: false, error, details });
};

const MessageService = {
  async sendWalletsLocked() {
    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.WALLETS_LOCKED,
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
    _message: ExtensionMessage & { type: typeof MESSAGE_TYPES.WALLETS_LOCKED },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseMessage) => void
  ) {
    try {
      await chrome.storage.local.set({ walletLocked: true });
      KeyringService.lockWallets();
      sendResponse({ success: true });
    } catch (error) {
      console.error('[MessageHandler] Error handling wallets locked:', error);
      sendErrorResponse(sendResponse, ERROR_TYPES.UNKNOWN_ERROR, error);
    }
    return true;
  },

  setupMessageListeners() {
    const messageListener = (
      message: ExtensionMessage | DappMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: ResponseMessage | { approved: boolean }) => void
    ) => {
      if (!message || !message.type) {
        sendErrorResponse(sendResponse, ERROR_TYPES.INVALID_MESSAGE);
        return true;
      }

      switch (message.type) {
        case MESSAGE_TYPES.WALLETS_LOCKED:
          return this.handleLockMessage(
            message as ExtensionMessage & {
              type: typeof MESSAGE_TYPES.WALLETS_LOCKED;
            },
            sender,
            sendResponse as (response: ResponseMessage) => void
          );

        case MESSAGE_TYPES.CONNECT_RESPONSE:
        case MESSAGE_TYPES.SIGN_RESPONSE:
        case MESSAGE_TYPES.SIGN_REQUEST:
        case MESSAGE_TYPES.CONNECT_REQUEST:
          return true;

        default:
          console.log('[MessageHandler] Unknown message type:', message.type);
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

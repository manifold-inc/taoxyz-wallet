import type {
  Injected,
  InjectedAccount,
  InjectedWindowProvider,
} from '@polkadot/extension-inject/types';
import type { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';

import { ERROR_TYPES, MESSAGE_TYPES } from '../types/messages';
import type {
  ConnectResponsePayload,
  DappMessage,
  ExtensionMessage,
  MessagePayloadMap,
  SignResponsePayload,
} from '../types/messages';
import { generateId } from '../utils/utils';

// Interface for the dApp, this holds the logic for the routing for content.ts.

const dappMessageHandler = <T extends keyof MessagePayloadMap>(
  messageType: T,
  callback: (payload: MessagePayloadMap[T]) => void
) => {
  const handler = (event: MessageEvent<ExtensionMessage>) => {
    if (event.data.type === messageType) {
      window.removeEventListener('message', handler);
      callback(event.data.payload as MessagePayloadMap[T]);
    }
  };
  return handler;
};

const walletsHandler = (wallets: InjectedAccount[]) => {
  return {
    get: async () => {
      return wallets;
    },
    subscribe: (cb: (wallets: InjectedAccount[]) => void) => {
      cb(wallets);
      return (): void => {
        // No-op unsubscribe function
      };
    },
  };
};

const signerHandler = () => ({
  signPayload: async (payload: SignerPayloadJSON): Promise<SignerResult> => {
    return new Promise((resolve, reject) => {
      const id = generateId();
      const handleSignResponse = dappMessageHandler(
        MESSAGE_TYPES.SIGN_RESPONSE,
        (response: SignResponsePayload) => {
          if (response.approved === false) {
            reject(new Error(ERROR_TYPES.PERMISSION_DENIED));
            return;
          }

          if (!response.signature) {
            reject(new Error(ERROR_TYPES.SIGNING_FAILED));
            return;
          }
          resolve({ id: response.id, signature: response.signature });
        }
      );

      window.addEventListener('message', handleSignResponse);
      sendMessage({
        type: MESSAGE_TYPES.SIGN_REQUEST,
        payload: {
          id,
          address: payload.address,
          data: payload,
          origin: window.location.origin,
        },
      });
    });
  },

  signRaw: async (payload: SignerPayloadRaw): Promise<SignerResult> => {
    return new Promise((resolve, reject) => {
      const id = generateId();
      const handleSignResponse = dappMessageHandler(
        MESSAGE_TYPES.SIGN_RESPONSE,
        (response: SignResponsePayload) => {
          if (!response.signature) {
            reject(new Error(ERROR_TYPES.SIGNING_FAILED));
            return;
          }

          resolve({ id: response.id, signature: response.signature });
        }
      );

      window.addEventListener('message', handleSignResponse);
      sendMessage({
        type: MESSAGE_TYPES.SIGN_REQUEST,
        payload: {
          id,
          address: payload.address,
          data: payload,
          origin: window.location.origin,
        },
      });
    });
  },
});

const sendMessage = (message: DappMessage) => {
  window.postMessage(message, message.payload.origin);
};

export const TaoxyzWalletProvider: InjectedWindowProvider = {
  enable: async (): Promise<Injected> => {
    const origin = window.location.origin;

    return new Promise((resolve, reject) => {
      const handleAuthResponse = dappMessageHandler(
        MESSAGE_TYPES.CONNECT_RESPONSE,
        (response: ConnectResponsePayload) => {
          if (!response.approved) {
            reject(new Error(ERROR_TYPES.CONNECTION_REJECTED));
            return;
          }
          resolve({
            accounts: walletsHandler(response.wallets),
            signer: signerHandler(),
          });
        }
      );

      window.addEventListener('message', handleAuthResponse);
      sendMessage({
        type: MESSAGE_TYPES.CONNECT_REQUEST,
        payload: { origin },
      });
    });
  },
};

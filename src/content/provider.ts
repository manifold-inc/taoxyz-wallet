import { MESSAGE_TYPES, ERROR_TYPES } from "../types/messages";
import type {
  InjectedWindowProvider,
  InjectedAccount,
  Injected,
} from "@polkadot/extension-inject/types";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
  SignerResult,
} from "@polkadot/types/types";
import type {
  DappMessage,
  ExtensionMessage,
  ConnectResponsePayload,
  SignResponsePayload,
  MessagePayloadMap,
} from "../types/messages";
import { generateId } from "../utils/utils";

const dappMessageHandler = <T extends keyof MessagePayloadMap>(
  messageType: T,
  callback: (payload: MessagePayloadMap[T]) => void
) => {
  const handler = (event: MessageEvent<ExtensionMessage>) => {
    if (event.data.type === messageType) {
      console.log(
        `[Provider] Received ${messageType} response:`,
        event.data.payload
      );
      window.removeEventListener("message", handler);
      callback(event.data.payload as MessagePayloadMap[T]);
    }
  };
  return handler;
};

const errorHandler = (error: Error, context: string) => {
  console.error(`[Provider] ${context}:`, error.message);
  throw error;
};

const accountsHandler = (accounts: InjectedAccount[]) => {
  console.log(
    "[Provider] Creating accounts interface with:",
    accounts.length,
    "accounts"
  );
  return {
    get: async () => {
      console.log("[Provider] Getting accounts");
      return accounts;
    },
    subscribe: (cb: (accounts: InjectedAccount[]) => void) => {
      console.log("[Provider] Setting up account subscription");
      cb(accounts);
      return () => {
        console.log("[Provider] Cleaning up account subscription");
      };
    },
  };
};

const signerHandler = () => ({
  signPayload: async (payload: SignerPayloadJSON): Promise<SignerResult> => {
    console.log("[Provider] Sign payload requested:", {
      address: payload.address,
      method: payload.method,
    });

    return new Promise((resolve, reject) => {
      const id = generateId();
      const handleSignResponse = dappMessageHandler(
        MESSAGE_TYPES.SIGN_RESPONSE,
        (response: SignResponsePayload) => {
          if (!response.signature) {
            errorHandler(new Error(ERROR_TYPES.SIGNING_FAILED), "Sign Payload");
            reject();
            return;
          }

          console.log("[Provider] Signature received:", {
            id: response.id,
            signaturePrefix: response.signature.slice(0, 10) + "...",
          });
          resolve({ id: response.id, signature: response.signature });
        }
      );

      window.addEventListener("message", handleSignResponse);
      sendMessage({
        type: MESSAGE_TYPES.SIGN_REQUEST,
        payload: {
          id,
          address: payload.address,
          data: payload,
        },
      });
    });
  },

  signRaw: async (payload: SignerPayloadRaw): Promise<SignerResult> => {
    console.log("[Provider] Sign raw requested:", {
      address: payload.address,
      dataLength: payload.data.length,
    });

    return new Promise((resolve, reject) => {
      const id = generateId();
      const handleSignResponse = dappMessageHandler(
        MESSAGE_TYPES.SIGN_RESPONSE,
        (response: SignResponsePayload) => {
          if (!response.signature) {
            errorHandler(
              new Error(ERROR_TYPES.SIGNING_FAILED),
              "Sign Raw Payload"
            );
            reject();
            return;
          }

          console.log("[Provider] Raw signature received:", {
            id: response.id,
            signaturePrefix: response.signature.slice(0, 10) + "...",
          });
          resolve({ id: response.id, signature: response.signature });
        }
      );

      window.addEventListener("message", handleSignResponse);
      sendMessage({
        type: MESSAGE_TYPES.SIGN_REQUEST,
        payload: {
          id,
          address: payload.address,
          data: payload,
        },
      });
    });
  },
});

const sendMessage = (message: any) => {
  const origin = window.location.origin;
  const formattedMessage: DappMessage = {
    ...message,
    payload: {
      ...message.payload,
      origin,
    },
  };

  console.log(`[Provider] Sending ${message.type}:`, formattedMessage);

  window.postMessage(formattedMessage, origin);
};

export const TaoxyzWalletProvider: InjectedWindowProvider = {
  enable: async (): Promise<Injected> => {
    const origin = window.location.origin;
    console.log(`[Provider] Enable requested from origin:`, origin);

    return new Promise((resolve, reject) => {
      const handleAuthResponse = dappMessageHandler(
        MESSAGE_TYPES.CONNECT_RESPONSE,
        (response: ConnectResponsePayload) => {
          if (!response.approved) {
            errorHandler(new Error(ERROR_TYPES.CONNECTION_REJECTED), "Enable");
            reject();
            return;
          }
          console.log(
            "[Provider] Connection approved with",
            response.accounts.length,
            "accounts"
          );
          resolve({
            accounts: accountsHandler(response.accounts),
            signer: signerHandler(),
          });
        }
      );

      window.addEventListener("message", handleAuthResponse);
      sendMessage({
        type: MESSAGE_TYPES.CONNECT_REQUEST,
        payload: { origin },
      });
    });
  },
};

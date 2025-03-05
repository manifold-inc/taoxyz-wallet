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

interface DappMessage {
  source: string;
  type: string;
  payload: any;
}

interface ConnectResponse {
  approved: boolean;
  accounts: InjectedAccount[];
}

interface SignResponse {
  id: number;
  signature: `0x${string}`;
}

const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

const createMessageHandler = (
  messageType: string,
  callback: (payload: any) => void
) => {
  const handler = (event: MessageEvent<DappMessage>) => {
    if (
      event.data.source === "taoxyz-wallet-content" &&
      event.data.type === messageType
    ) {
      window.removeEventListener("message", handler);
      callback(event.data.payload);
    }
  };
  return handler;
};

const createAccounts = (accounts: InjectedAccount[]) => ({
  get: async () => accounts,
  subscribe: (cb: (accounts: InjectedAccount[]) => void) => {
    cb(accounts);
    return () => {};
  },
});

const createSigner = () => ({
  signPayload: async (payload: SignerPayloadJSON): Promise<SignerResult> => {
    return new Promise((resolve, reject) => {
      const id = generateId();

      const handleSignResponse = createMessageHandler(
        "ext(signResponse)",
        (response: SignResponse) => {
          if (response.signature) {
            resolve({
              id: response.id,
              signature: response.signature,
            });
          } else {
            reject(new Error("Signing failed"));
          }
        }
      );

      window.addEventListener("message", handleSignResponse);

      sendMessage({
        source: "taoxyz-wallet-dapp",
        type: "dapp(signRequest)",
        payload: {
          id,
          address: payload.address,
          data: payload,
        },
      });
    });
  },

  signRaw: async (payload: SignerPayloadRaw): Promise<SignerResult> => {
    return new Promise((resolve, reject) => {
      const id = generateId();

      const handleSignResponse = createMessageHandler(
        "ext(signResponse)",
        (response: SignResponse) => {
          if (response.signature) {
            resolve(response);
          } else {
            reject(new Error("Signing failed"));
          }
        }
      );

      window.addEventListener("message", handleSignResponse);

      sendMessage({
        source: "taoxyz-wallet-dapp",
        type: "dapp(signRequest)",
        payload: {
          id,
          address: payload.address,
          data: {
            data: payload.data,
            type: "bytes",
          },
        },
      });
    });
  },
});

const sendMessage = (message: DappMessage) => {
  window.postMessage(message, "*");
};

export const TaoxyzWalletProvider: InjectedWindowProvider = {
  enable: async (originName: string): Promise<Injected> => {
    console.log(`[Provider] Enable requested from: ${originName}`);

    return new Promise((resolve, reject) => {
      const handleAuthResponse = createMessageHandler(
        "ext(connectResponse)",
        (response: ConnectResponse) => {
          if (response.approved) {
            resolve({
              accounts: createAccounts(response.accounts),
              signer: createSigner(),
            });
          } else {
            reject(new Error("User rejected the request"));
          }
        }
      );

      window.addEventListener("message", handleAuthResponse);

      sendMessage({
        source: "taoxyz-wallet-dapp",
        type: "dapp(connectRequest)",
        payload: { origin: originName },
      });
    });
  },
};

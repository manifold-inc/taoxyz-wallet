import type {
  InjectedWindowProvider,
  InjectedAccount,
  Injected,
} from "@polkadot/extension-inject/types";

interface DappMessage {
  source: string;
  type: string;
  payload: any;
}

interface ConnectResponse {
  approved: boolean;
  accounts: InjectedAccount[];
}

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
  signPayload: async () => {
    throw new Error("Signing not implemented");
  },
  signRaw: async () => {
    throw new Error("Raw signing not implemented");
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

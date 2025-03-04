import type {
  InjectedWindowProvider,
  InjectedAccount,
  Injected,
} from "@polkadot/extension-inject/types";

export const TaoxyzWalletProvider: InjectedWindowProvider = {
  enable: async (originName: string): Promise<Injected> => {
    console.log(`[Content] Enable requested from: ${originName}`);

    return new Promise((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        if (
          event.data.source === "taoxyz-content" &&
          event.data.type === "AUTHORIZATION_RESPONSE"
        ) {
          window.removeEventListener("message", handler);

          if (event.data.payload.approved) {
            resolve({
              accounts: {
                get: async () => event.data.payload.accounts,
                subscribe: (cb: (accounts: InjectedAccount[]) => void) => {
                  cb(event.data.payload.accounts);
                  return () => {};
                },
              },
              signer: {},
            });
          } else {
            reject(new Error("User rejected the request"));
          }
        }
      };

      window.addEventListener("message", handler);
      window.postMessage(
        {
          source: "taoxyz-page",
          type: "AUTHORIZATION_REQUEST",
          payload: { origin: originName },
        },
        "*"
      );
    });
  },
};

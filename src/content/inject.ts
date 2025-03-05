import { injectExtension } from "@polkadot/extension-inject";
import { TaoxyzWalletProvider } from "./provider";

injectExtension(
  async (origin: string) => TaoxyzWalletProvider.enable!(origin),
  {
    name: "taoxyz-wallet",
    version: "1.0.0",
  }
);

export {};

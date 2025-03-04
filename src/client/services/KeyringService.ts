import keyring from "@polkadot/ui-keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { validateMnemonic } from "bip39";

export const KeyringService = {
  async addAccount(
    mnemonic: string,
    username: string,
    password: string
  ): Promise<KeyringPair> {
    const result = await keyring.addUri(mnemonic, password, {
      username,
    });
    return result.pair;
  },

  async unlockAccount(username: string, password: string): Promise<boolean> {
    const address = await this.getAddress(username);
    const pair = keyring.getPair(address);
    pair.decodePkcs8(password);
    return !pair.isLocked;
  },

  createMnemonic(): string {
    return mnemonicGenerate(12);
  },

  validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic);
  },

  async getAddress(username: string): Promise<string> {
    const pairs = keyring.getPairs();
    const pair = pairs.find((pair) => pair.meta.username === username);
    if (!pair) {
      throw new Error("Account not found");
    }
    return pair.address;
  },

  async getAccount(address: string): Promise<KeyringPair> {
    const pairs = keyring.getPairs();
    const pair = pairs.find((pair) => pair.address === address);
    if (!pair) {
      throw new Error("Account not found");
    }
    return pair;
  },

  getPairs(): KeyringPair[] {
    return keyring.getPairs();
  },
};

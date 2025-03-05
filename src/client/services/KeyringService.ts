import keyring from "@polkadot/ui-keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { TypeRegistry } from "@polkadot/types";
import type { SignerPayloadJSON } from "@polkadot/types/types";

const registry = new TypeRegistry();

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

  getAccounts(): KeyringPair[] {
    return keyring.getPairs();
  },

  async sign(
    address: string,
    payload: SignerPayloadJSON,
    password: string
  ): Promise<string> {
    try {
      const account = await this.getAccount(address);
      if (!account) {
        throw new Error("Unable to find account");
      }

      account.decodePkcs8(password);

      // Set up the registry with the signed extensions
      registry.setSignedExtensions(payload.signedExtensions);

      // Create the extrinsic payload
      const extrinsicPayload = registry.createType(
        "ExtrinsicPayload",
        payload,
        {
          version: payload.version,
        }
      );

      // Sign the payload
      const { signature } = extrinsicPayload.sign(account);

      // Lock the account again
      account.lock();

      return signature;
    } catch (error) {
      console.error("[KeyringService] Signing failed:", error);
      throw error;
    }
  },
};

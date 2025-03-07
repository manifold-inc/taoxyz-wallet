import keyring from "@polkadot/ui-keyring";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { TypeRegistry } from "@polkadot/types";

import type { KeyringPair, KeyringPair$Meta } from "@polkadot/keyring/types";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";

const registry = new TypeRegistry();

interface WebsitePermissions {
  [origin: string]: boolean;
}

export const KeyringService = {
  async addAccount(
    mnemonic: string,
    username: string,
    password: string
  ): Promise<KeyringPair> {
    const result = await keyring.addUri(mnemonic, password, {
      username,
      websitePermissions: {} as WebsitePermissions,
    } as KeyringPair$Meta);
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
  ): Promise<`0x${string}`> {
    try {
      const account = await this.getAccount(address);
      if (!account) {
        throw new Error("Unable to find account");
      }
      account.decodePkcs8(password);

      registry.setSignedExtensions(payload.signedExtensions);
      const extrinsicPayload = registry.createType(
        "ExtrinsicPayload",
        payload,
        {
          version: payload.version,
        }
      );

      const { signature } = extrinsicPayload.sign(account);
      account.lock();
      return signature;
    } catch (error) {
      console.error("[KeyringService] Signing failed:", error);
      throw error;
    }
  },

  async getPermissions(address: string): Promise<WebsitePermissions> {
    const account = await this.getAccount(address);
    return (account.meta.websitePermissions as WebsitePermissions) || {};
  },

  async updatePermissions(
    origin: string,
    address: string,
    allowAccess: boolean
  ): Promise<boolean> {
    try {
      const account = await this.getAccount(address);

      if (!account) {
        console.error("[KeyringService] Account not found");
        return false;
      }

      const meta = { ...account.meta };
      const permissions = (meta.websitePermissions as WebsitePermissions) || {};
      permissions[origin] = allowAccess;

      meta.websitePermissions = permissions;
      keyring.saveAccountMeta(account, meta);

      console.log("[KeyringService] Updated permissions:", {
        address: account.address,
        permissions: permissions,
      });
      return true;
    } catch (error) {
      console.error("[KeyringService] Updating permissions failed:", error);
      return false;
    }
  },
};

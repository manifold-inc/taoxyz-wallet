import keyring from "@polkadot/ui-keyring";
import { mnemonicGenerate, mnemonicValidate } from "@polkadot/util-crypto";
import { TypeRegistry } from "@polkadot/types";
import type { KeyringPair, KeyringPair$Meta } from "@polkadot/keyring/types";
import type { SignerPayloadJSON } from "@polkadot/types/types";

import LockManager from "../../utils/lock";
import type { Permissions } from "../../types/client";

const registry = new TypeRegistry();

export const KeyringService = {
  async addAccount(
    mnemonic: string,
    username: string,
    password: string
  ): Promise<KeyringPair> {
    const result = await keyring.addUri(mnemonic, password, {
      username,
      websitePermissions: {} as Permissions,
    } as KeyringPair$Meta);
    return result.pair;
  },

  async unlockAccount(username: string, password: string): Promise<boolean> {
    const address = await this.getAddress(username);
    const pair = keyring.getPair(address);

    pair.decodePkcs8(password);
    if (!pair.isLocked) {
      LockManager.startLockTimer();
      return true;
    }
    return false;
  },

  createMnemonic(): string {
    return mnemonicGenerate(12);
  },

  validateMnemonic(mnemonic: string): boolean {
    return mnemonicValidate(mnemonic);
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
      return signature;
    } catch (error) {
      console.error("[KeyringService] Signing failed:", error);
      throw error;
    }
  },

  async getPermissions(address: string): Promise<Permissions> {
    const account = await this.getAccount(address);
    return (account.meta.websitePermissions as Permissions) || {};
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
      const permissions = (meta.websitePermissions as Permissions) || {};
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

  lockAll(): void {
    const pairs = keyring.getPairs();
    pairs.forEach((pair) => {
      if (!pair.isLocked) {
        pair.lock();
      }
    });
  },

  isLocked(address: string): boolean {
    try {
      const account = keyring.getPair(address);
      return account.isLocked;
    } catch (error) {
      console.error("[KeyringService] Error checking lock status:", error);
      return true;
    }
  },
};

export default KeyringService;

import keyring from "@polkadot/ui-keyring";
import { mnemonicGenerate, mnemonicValidate } from "@polkadot/util-crypto";
import { TypeRegistry } from "@polkadot/types";
import type { KeyringPair, KeyringPair$Meta } from "@polkadot/keyring/types";
import type { SignerPayloadJSON } from "@polkadot/types/types";

import type { Permissions } from "../../types/client";

const registry = new TypeRegistry();

export const KeyringService = {
  async addAccount(
    mnemonic: string,
    username: string,
    password: string
  ): Promise<KeyringPair | Error> {
    try {
      const result = await keyring.addUri(mnemonic, password, {
        username,
        websitePermissions: {} as Permissions,
      } as KeyringPair$Meta);
      if (!result.pair) return new Error("Failed to add account");
      return result.pair;
    } catch {
      return new Error("Failed to add account");
    }
  },

  async unlockAccount(username: string, password: string): Promise<boolean> {
    const address = await this.getAddress(username);
    if (address instanceof Error) return false;

    const pair = keyring.getPair(address);
    if (!pair) return false;

    try {
      pair.decodePkcs8(password);
    } catch {
      return false;
    }

    if (!pair.isLocked) {
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

  async getAddress(username: string): Promise<string | Error> {
    const pairs = keyring.getPairs();
    if (!pairs) return new Error("Keyring not initialized");
    const pair = pairs.find((pair) => pair.meta.username === username);
    if (!pair) return new Error("Account not found");

    return pair.address;
  },

  async getAccount(address: string): Promise<KeyringPair> {
    const pairs = keyring.getPairs();
    if (!pairs) throw new Error("Keyring not initialized");
    const pair = pairs.find((pair) => pair.address === address);
    if (!pair) throw new Error("Account not found");
    try {
      return pair;
    } catch (error) {
      console.error("[KeyringService] Error getting account:", error);
      throw error;
    }
  },

  // TODO: Figure out error handling for walletselection, where does the notification display
  getWallets(): KeyringPair[] {
    return keyring.getPairs();
  },

  async sign(
    address: string,
    payload: SignerPayloadJSON,
    password: string
  ): Promise<`0x${string}`> {
    const account = await this.getAccount(address);
    if (!account) throw new Error("Unable to find account");
    try {
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
    if (!account) throw new Error("Account not found");
    try {
      return (account.meta.websitePermissions as Permissions) || {};
    } catch (error) {
      console.error("[KeyringService] Error getting permissions:", error);
      throw error;
    }
  },

  async updatePermissions(
    origin: string,
    address: string,
    allowAccess: boolean,
    removeWebsite = false
  ): Promise<boolean> {
    const account = await this.getAccount(address);
    if (!account) throw new Error("Account not found");
    try {
      const meta = { ...account.meta };
      const permissions = (meta.websitePermissions as Permissions) || {};

      if (removeWebsite) {
        permissions[origin] = undefined;
      } else {
        permissions[origin] = allowAccess;
      }

      meta.websitePermissions = permissions;
      keyring.saveAccountMeta(account, meta);
      chrome.storage.local.set({
        [`permissions_${account.address}`]: { permissions },
      });

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
    if (!pairs) throw new Error("Keyring not initialized");
    try {
      pairs.forEach((pair) => {
        if (!pair.isLocked) {
          pair.lock();
        }
      });
    } catch (error) {
      console.error("[KeyringService] Error locking all accounts:", error);
      throw error;
    }
  },

  isLocked(address: string): boolean {
    const account = keyring.getPair(address);
    if (!account) throw new Error("Account not found");
    try {
      return account.isLocked;
    } catch (error) {
      console.error("[KeyringService] Error checking lock status:", error);
      return true;
    }
  },
};

export default KeyringService;

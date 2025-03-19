import keyring from "@polkadot/ui-keyring";
import { mnemonicGenerate, mnemonicValidate } from "@polkadot/util-crypto";
import { TypeRegistry } from "@polkadot/types";
import type { KeyringPair, KeyringPair$Meta } from "@polkadot/keyring/types";
import type { SignerPayloadJSON } from "@polkadot/types/types";

import MessageService from "./MessageService";
import type { Permissions } from "../../types/client";

const registry = new TypeRegistry();

export const KeyringService = {
  async addAccount(
    mnemonic: string,
    username: string,
    password: string
  ): Promise<KeyringPair> {
    try {
      const result = await keyring.addUri(mnemonic, password, {
        username,
        websitePermissions: {} as Permissions,
      } as KeyringPair$Meta);
      return result.pair;
    } catch (error) {
      console.error("[KeyringService] Error adding account:", error);
      throw error;
    }
  },

  async unlockAccount(username: string, password: string): Promise<boolean> {
    const address = await this.getAddress(username);
    if (!address) throw new Error("Account not found");
    const pair = keyring.getPair(address);
    if (!pair) throw new Error("Account not found");
    try {
      pair.decodePkcs8(password);
      if (!pair.isLocked) {
        MessageService.sendClearLockTimer();
        return true;
      }
      return false;
    } catch (error) {
      console.error("[KeyringService] Error unlocking account:", error);
      throw error;
    }
  },

  createMnemonic(): string {
    try {
      return mnemonicGenerate(12);
    } catch (error) {
      console.error("[KeyringService] Error creating mnemonic:", error);
      throw error;
    }
  },

  validateMnemonic(mnemonic: string): boolean {
    try {
      return mnemonicValidate(mnemonic);
    } catch (error) {
      console.error("[KeyringService] Error validating mnemonic:", error);
      throw error;
    }
  },

  async getAddress(username: string): Promise<string> {
    const pairs = keyring.getPairs();
    if (!pairs) throw new Error("Keyring not initialized");
    const pair = pairs.find((pair) => pair.meta.username === username);
    if (!pair) throw new Error("Account not found");
    try {
      return pair.address;
    } catch (error) {
      console.error("[KeyringService] Error getting address:", error);
      throw error;
    }
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

  getAccounts(): KeyringPair[] {
    try {
      return keyring.getPairs();
    } catch (error) {
      console.error("[KeyringService] Error getting accounts:", error);
      throw error;
    }
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

import keyring from "@polkadot/ui-keyring";
import { mnemonicGenerate, mnemonicValidate } from "@polkadot/util-crypto";
import { TypeRegistry } from "@polkadot/types";
import type { KeyringPair, KeyringPair$Meta } from "@polkadot/keyring/types";
import type { SignerPayloadJSON } from "@polkadot/types/types";

import type { Permissions } from "../../types/client";

const registry = new TypeRegistry();

export const KeyringService = {
  async addWallet(
    mnemonic: string,
    username: string,
    password: string
  ): Promise<KeyringPair | Error> {
    try {
      const result = await keyring.addUri(mnemonic, password, {
        username,
        websitePermissions: {} as Permissions,
      } as KeyringPair$Meta);
      if (!result.pair) return new Error("Failed to add wallet");
      return result.pair;
    } catch {
      return new Error("Failed to add wallet");
    }
  },

  unlockWallet(address: string, password: string): boolean {
    const wallet = this.getWallet(address);
    if (wallet instanceof Error) return false;

    wallet.decodePkcs8(password);
    if (wallet.isLocked) return false;
    return true;
  },

  createMnemonic(): string {
    return mnemonicGenerate(12);
  },

  validateMnemonic(mnemonic: string): boolean {
    return mnemonicValidate(mnemonic);
  },

  // TODO: Figure out how to handle multiple wallets with the same name or make the names unique
  async getAddress(username: string): Promise<string | Error> {
    const wallets = this.getWallets();
    if (!wallets) return new Error("Keyring not initialized");
    const wallet = wallets.find((wallet) => wallet.meta.username === username);
    if (!wallet) return new Error("Wallet not found");

    return wallet.address;
  },

  getWallet(address: string): KeyringPair | Error {
    const wallet = keyring.getPair(address);
    if (!wallet) return new Error("Wallet not found");
    return wallet;
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
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) throw new Error(wallet.message);
    try {
      wallet.decodePkcs8(password);

      registry.setSignedExtensions(payload.signedExtensions);
      const extrinsicPayload = registry.createType(
        "ExtrinsicPayload",
        payload,
        {
          version: payload.version,
        }
      );

      const { signature } = extrinsicPayload.sign(wallet);
      return signature;
    } catch (error) {
      console.error("[KeyringService] Signing failed:", error);
      throw error;
    }
  },

  async getPermissions(address: string): Promise<Permissions> {
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) throw new Error(wallet.message);
    try {
      return (wallet.meta.websitePermissions as Permissions) || {};
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
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) throw new Error(wallet.message);
    try {
      const meta = { ...wallet.meta };
      const permissions = (meta.websitePermissions as Permissions) || {};

      if (removeWebsite) {
        permissions[origin] = undefined;
      } else {
        permissions[origin] = allowAccess;
      }

      meta.websitePermissions = permissions;
      keyring.saveAccountMeta(wallet, meta);
      chrome.storage.local.set({
        [`permissions_${wallet.address}`]: { permissions },
      });

      console.log("[KeyringService] Updated permissions:", {
        address: wallet.address,
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
    const wallet = this.getWallet(address);
    if (wallet instanceof Error) throw new Error(wallet.message);
    try {
      return wallet.isLocked;
    } catch (error) {
      console.error("[KeyringService] Error checking lock status:", error);
      return true;
    }
  },
};

export default KeyringService;

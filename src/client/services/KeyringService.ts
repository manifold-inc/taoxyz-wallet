import keyring from "@polkadot/ui-keyring";
import { mnemonicGenerate, mnemonicValidate } from "@polkadot/util-crypto";
import { TypeRegistry } from "@polkadot/types";
import type { KeyringPair, KeyringPair$Meta } from "@polkadot/keyring/types";
import type { SignerPayloadJSON } from "@polkadot/types/types";

import type { Permissions } from "../../types/client";

const registry = new TypeRegistry();

export const KeyringService = {
  async checkDuplicate(mnemonic: string): Promise<boolean | Error> {
    try {
      const wallets = this.getWallets();
      const address = keyring.createFromUri(mnemonic).address;
      const isDuplicate = wallets.some((wallet) => wallet.address === address);
      return isDuplicate;
    } catch {
      return new Error("Failed to Verify Wallet");
    }
  },

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
      if (!result.pair) return new Error("Failed to Add Wallet");
      return result.pair;
    } catch {
      return new Error("Failed to Add Wallet");
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

  getWallets(): KeyringPair[] {
    return keyring.getPairs();
  },

  deleteWallet(address: string): boolean {
    try {
      keyring.forgetAccount(address);
      return true;
    } catch {
      return false;
    }
  },

  async sign(
    address: string,
    payload: SignerPayloadJSON,
    password: string
  ): Promise<`0x${string}` | Error> {
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) return new Error(wallet.message);
    try {
      wallet.decodePkcs8(password);
      if (wallet.isLocked) return new Error("Wallet is Locked");

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
    } catch {
      return new Error("Failed to Sign Transaction");
    }
  },

  async getPermissions(address: string): Promise<Permissions | Error> {
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) return new Error(wallet.message);
    return (wallet.meta.websitePermissions as Permissions) || {};
  },

  async updatePermissions(
    origin: string,
    address: string,
    allowAccess: boolean,
    removeWebsite = false
  ): Promise<boolean | Error> {
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) return new Error(wallet.message);

    try {
      const meta = { ...wallet.meta };
      const permissions = (meta.websitePermissions as Permissions) || {};

      if (removeWebsite) {
        // eslint-disable-next-line
        delete permissions[origin];
      } else {
        permissions[origin] = allowAccess;
      }

      meta.websitePermissions = permissions;
      keyring.saveAccountMeta(wallet, meta);
      await chrome.storage.local.set({
        [`permissions_${wallet.address}`]: { permissions },
      });

      return true;
    } catch {
      return new Error("Failed to Update Permissions");
    }
  },

  lockWallets(): boolean | Error {
    const pairs = keyring.getPairs();
    if (!pairs) return new Error("Keyring not initialized");
    try {
      pairs.forEach((pair) => {
        if (!pair.isLocked) {
          pair.lock();
        }
      });
      return true;
    } catch {
      return new Error("Failed to Lock All Wallets");
    }
  },

  isLocked(address: string): boolean | Error {
    const wallet = this.getWallet(address);
    if (wallet instanceof Error) return new Error(wallet.message);
    return wallet.isLocked;
  },
};

export default KeyringService;

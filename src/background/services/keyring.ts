import { validateMnemonic } from "@polkadot/util-crypto/mnemonic/bip39";
import { Keyring } from "@polkadot/api";

import type { Account } from "../../types/account";

export class KeyringService {
  private keyring: Keyring;

  constructor() {
    this.keyring = new Keyring({ type: "sr25519" });
  }

  public async validateMnemonic(mnemonic: string): Promise<boolean> {
    return validateMnemonic(mnemonic);
  }

  public async addAccount(
    mnemonic: string,
    username: string,
    password: string
  ) {
    const account = this.keyring.addFromUri(mnemonic, {
      name: username,
      username: username,
      password: password,
    });

    const serializedAccount: Account = {
      address: account.address,
      isLocked: true,
      metadata: {
        username: username,
      },
    };
    const existingAccounts = await this.loadAccounts();
    const updatedAccounts = [...existingAccounts, serializedAccount];
    await chrome.storage.local.set({ accounts: updatedAccounts });
    return account;
  }

  public async loadAccounts() {
    const result = await chrome.storage.local.get("accounts");
    return result.accounts || [];
  }
}

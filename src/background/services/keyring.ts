import { validateMnemonic } from "@polkadot/util-crypto/mnemonic/bip39";
import { Keyring } from "@polkadot/ui-keyring";
import keyring from "@polkadot/ui-keyring";

export class KeyringService {
  private keyring: Keyring;

  constructor() {
    this.keyring = keyring;
    // TODO: Figure out how to store accounts in storage.ts
    this.keyring.loadAll({ ss58Format: 42, type: "sr25519" });
  }

  public async validateMnemonic(mnemonic: string): Promise<boolean> {
    return validateMnemonic(mnemonic);
  }

  public getAllAccounts() {
    return this.keyring.getAccounts();
  }
}

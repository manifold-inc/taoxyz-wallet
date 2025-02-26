import keyring from "@polkadot/ui-keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { validateMnemonic } from "@polkadot/util-crypto/mnemonic/bip39";

export class KeyringService {
  constructor() {
    this.initializeKeyring();
  }

  private async initializeKeyring(): Promise<void> {
    try {
      await cryptoWaitReady();
      keyring.loadAll({ type: "sr25519" });
      console.log(`Keyring Pairs: ${JSON.stringify(keyring.getPairs())}`);
    } catch (error) {
      console.error("Failed to initialize keyring:", error);
      throw error;
    }
  }

  public async validateMnemonic(mnemonic: string): Promise<boolean> {
    return validateMnemonic(mnemonic);
  }

  // public async getAccounts() {
  //   const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  //   return accounts;
  // }

  // public async getAccount(name: string) {
  //   const accounts = await this.getAccounts();
  //   const account = accounts.find((account: Account) => account.name === name);
  //   return account;
  // }

  public async addAccount(
    mnemonic: string,
    username: string,
    password: string
  ) {
    const result = keyring.addUri(mnemonic, password, { name: username });
    //keyring.saveAccount(result.pair, password);
    console.log(JSON.stringify(keyring.getPairs()));
    // const account = {
    //   name: username,
    //   address: result.json.address,
    // };

    // const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    // accounts.push(account);
    // localStorage.setItem("accounts", JSON.stringify(accounts));
    return result;
  }

  public async unlockAccount(name: string, password: string) {
    //grab account from name or address
    const pair = keyring.getPair(name);
    console.log(pair);
    pair.decodePkcs8(password);

    if (!pair.isLocked) {
      return pair;
    }
    throw new Error("Invalid password");
  }
}

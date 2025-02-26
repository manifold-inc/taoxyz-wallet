import keyring from "@polkadot/ui-keyring";
import type { KeyringPair } from "@polkadot/keyring/types";

export const useKeyring = () => {
  const addAccount = async (
    mnemonic: string,
    username: string,
    password: string
  ): Promise<KeyringPair> => {
    const result = await keyring.addUri(mnemonic, password, {
      username,
    });
    return result.pair;
  };

  const unlockAccount = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const address = await getAddress(username);
    const pair = keyring.getPair(address);
    pair.decodePkcs8(password);
    if (!pair.isLocked) {
      return true;
    }
    return false;
  };

  const validateMnemonic = async (mnemonic: string): Promise<boolean> => {
    return validateMnemonic(mnemonic);
  };

  const getAddress = async (username: string): Promise<string> => {
    const pairs = keyring.getPairs();
    const pair = pairs.find((pair) => pair.meta.username === username);
    if (!pair) {
      throw new Error("Account not found");
    }
    return pair.address;
  };

  return {
    addAccount,
    unlockAccount,
    validateMnemonic,
    getAddress,
  };
};

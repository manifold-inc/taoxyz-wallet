export type MessageListeners = (payload: any) => Promise<any>;

export type ImportWalletRequest = {
  type: "pub(import.wallet)";
  payload: {
    name: string;
    password: string;
    mnemonic: string;
  };
};

export type UnlockAccountRequest = {
  type: "pub(unlock.account)";
  payload: {
    name: string;
    password: string;
  };
};

export type Message = ImportWalletRequest | UnlockAccountRequest;

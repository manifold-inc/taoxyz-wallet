export type MessageListeners = (payload: any) => Promise<any>;

export type ImportWalletRequest = {
  type: "pub(import.wallet)";
  payload: {
    username: string;
    password: string;
    mnemonic: string;
  };
};

export type Message = ImportWalletRequest;

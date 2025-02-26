export type MessageListeners = (payload: any) => Promise<any>;

export type GetBalanceRequest = {
  type: "ext(getBalance)";
  payload: {
    address: string;
  };
};

export type Message = GetBalanceRequest;

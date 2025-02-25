export interface Account {
  address: string;
  isLocked: boolean;
  metadata: {
    username: string;
  };
}

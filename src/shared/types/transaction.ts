export interface TransactionRequest {
  to: string;
  amount: string;
  data?: string;
}

export interface SignatureRequest {
  message: string;
  account: string;
} 
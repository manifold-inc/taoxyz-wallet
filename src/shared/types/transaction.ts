// Transaction-related type definitions

interface Transaction {
  // Transaction structure
}

interface TransactionRequest {
  to: string;
  amount: string;
  data?: string;
}

export interface SignatureRequest {
  message: string;
  account: string;
}

// Other transaction-related types 
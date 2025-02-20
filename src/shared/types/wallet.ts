// Wallet-related type definitions

export interface Account {
  address: string;
  name: string;
  balance: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface KeyPair {
  // Key pair structure
}

// Other wallet-related types 
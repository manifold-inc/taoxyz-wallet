export interface Wallet {
  name: string;
  address: string;
}

export interface Subnet {
  id: number;
  name: string;
  tokenSymbol?: string;
  price: number;
  tempo?: number;
  lastStep?: number;
  blocksSinceLastStep?: number;
  emission?: number;
  alphaIn?: number;
  alphaOut?: number;
  taoIn?: number;
  alphaOutEmission?: number;
  alphaInEmission?: number;
  taoInEmission?: number;
  pendingAlphaEmission?: number;
  pendingRootEmission?: number;
  subnetVolume?: number;
  networkRegisteredAt?: number;
  subnetIdentity?: SubnetIdentity;
  movingPrice?: {
    bits: number;
  };
}

export interface Validator {
  name: string | null;
  index: number;
  hotkey: string;
  coldkey: string;
}

export interface ValidatorIdentity {
  name: `0x${string}`;
  description: string;
  discord: string;
  githubRepo: string;
  image: string;
  url: string;
}

export interface Stake {
  netuid: number;
  hotkey: string;
  coldkey: string;
  stake: bigint;
  emission: number;
  taoEmission: number;
  drain: number;
  isRegistered: boolean;
  locked: number;
}

export interface Slippage {
  tokens: number;
  slippage: number;
  slippagePercentage: number;
}

export type Permissions = Record<string, boolean>;

export type PermissionsPerWebsite = Record<
  string,
  {
    walletCount: number;
    wallets: {
      address: string;
      name: string;
      hasAccess: boolean;
    }[];
  }
>;

export enum NotificationType {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Pending = 'pending',
  InBlock = 'inBlock',
  Success = 'success',
}

interface SubnetIdentity {
  subnetName: string;
  githubRepo: string;
  subnetContact: string;
  subnetUrl: string;
  discord: string;
  description: string;
  additional?: string;
}

// BLOCKCHAIN TYPES
export interface BittensorSubnet {
  netuid: number;
  ownerHotkey: string;
  ownerColdkey: string;
  subnetName: number[];
  tokenSymbol: number[];
  tempo: number;
  lastStep: number;
  blocksSinceLastStep: number;
  emission: number;
  taoIn: number;
  subnetIdentity: SubnetIdentity;
  alphaIn: number;
  alphaOut: number;
  alphaOutEmission: number;
  alphaInEmission: number;
  taoInEmission: number;
  pendingAlphaEmission: number;
  pendingRootEmission: number;
}

export interface BittensorMetagraph {
  hotkeys: string[];
  coldkeys: string[];
  active: boolean[];
  validatorPermit: boolean[];
  identities: string[];
  netuid: number;
}

export interface SubstrateAccount {
  nonce: number;
  consumers: number;
  providers: number;
  sufficients: number;
  data: {
    free: number;
    reserved: number;
    frozen: number;
  };
  flags: number[];
}

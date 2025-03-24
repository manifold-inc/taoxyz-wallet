export interface Wallet {
  name: string;
  address: string;
}

export interface Subnet {
  id: number;
  name: string;
  tokenSymbol?: string;
  price?: number;
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
  subnetIdentity?: string;
  movingPrice?: {
    bits: number;
  };
}

export interface Validator {
  index: number;
  hotkey: string;
  coldkey: string;
}

export interface StakeTransaction {
  subnetId: number;
  subnetName: string;
  validatorHotkey: string;
  tokens: number;
}

export interface Slippage {
  tokens: number;
  slippagePercentage: number;
}

export type PermissionsPerWebsite = Record<
  string,
  {
    walletCount: number;
    wallets: {
      address: string;
      username: string;
      hasAccess: boolean;
    }[];
  }
>;

export enum NotificationType {
  Error = "error",
  Pending = "pending",
  InBlock = "inBlock",
  Success = "success",
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

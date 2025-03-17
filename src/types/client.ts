export interface Account {
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
  validatorHotkey: string;
  tokens: number;
}

export interface Slippage {
  tokens: number;
  slippagePercentage: number;
  slippage: number;
}

export type PermissionsPerWebsite = Record<
  string,
  {
    accountCount: number;
    accounts: {
      address: string;
      username: string;
      hasAccess: boolean;
    }[];
  }
>;
export type Permissions = Record<string, boolean>;

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

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

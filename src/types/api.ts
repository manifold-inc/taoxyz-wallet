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
}

export interface ValidatorIdentity {
  name: `0x${string}`;
  description: string;
  discord: string;
  githubRepo: string;
  image: string;
  url: string;
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

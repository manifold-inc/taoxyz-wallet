export interface Subnet {
  subnetId: number;
  name: string;
  price: number;
}

export interface Validator {
  index: number;
  hotkey: string;
  coldkey: string;
}

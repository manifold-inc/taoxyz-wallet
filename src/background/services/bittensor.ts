// Handles blockchain-specific operations:
// - RPC calls to nodes
// - Query account balances/nonces
// - Submit signed transactions
// - Track transaction status
// - Staking operations
// - Network-specific formatting
// - Handle network responses/errors

import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import type { SubnetInfo, ValidatorInfo } from "../../types/subnets";

export class BittensorService {
  private api!: ApiPromise;
  private provider!: WsProvider;

  private readonly endpoint = {
    test: "wss://test.finney.opentensor.ai:443",
    main: "wss://entrypoint-finney.opentensor.ai:443",
  };

  constructor() {
    this.initializeApi();
  }

  private async initializeApi(): Promise<void> {
    this.provider = new WsProvider(this.endpoint.test);
    try {
      this.api = await ApiPromise.create({
        provider: this.provider,
        throwOnConnect: true,
      });
      await this.api.isReady;
      console.log(`Connected to the endpoint: ${this.endpoint.test}`);
    } catch (error) {
      console.error("Failed to initialize the Bittensor API:", error);
      throw error;
    }
  }

  public getApi(): ApiPromise {
    return this.api;
  }

  public async getBalance(address: string): Promise<string> {
    try {
      const accountBalance = await this.api.query.system.account(address);
      const {
        data: { free },
      } = accountBalance.toJSON() as any;

      const balanceInTao = (free / 1e9).toFixed(4);
      return balanceInTao;
    } catch (error) {
      console.error("Error in getBalance:", error);
      throw error;
    }
  }

  public async getSubnets(): Promise<SubnetInfo[]> {
    try {
      const allSubnetsInfo =
        await this.api.call.subnetInfoRuntimeApi.getAllDynamicInfo();

      const subnets = (allSubnetsInfo.toJSON() as any[])
        .map((info) => {
          if (!info) return null;
          const subnetName = info.subnetName
            ? String.fromCharCode(...info.subnetName)
            : `Subnet ${info.netuid}`;

          const price =
            info.netuid === 0
              ? 1
              : info.taoIn && info.alphaIn && info.alphaIn > 0
              ? Number((info.taoIn / info.alphaIn).toFixed(4))
              : 0;

          const subnet: SubnetInfo = {
            subnetId: info.netuid,
            name: subnetName,
            price: price,
          };
          return subnet;
        })
        .filter((subnet): subnet is SubnetInfo => subnet !== null);

      return subnets;
    } catch (error) {
      console.error("Error in getSubnets:", error);
      throw error;
    }
  }

  public async getValidators(subnetId: number): Promise<ValidatorInfo[]> {
    try {
      const metagraph = await this.api.call.subnetInfoRuntimeApi.getMetagraph(
        subnetId
      );
      const data = metagraph.toJSON() as any;
      if (!data || !data.coldkeys || !data.active || !data.validatorPermit) {
        throw new Error("Invalid metagraph data structure");
      }

      const validators: ValidatorInfo[] = [];
      for (let i = 0; i < data.coldkeys.length; i++) {
        if (data.active[i] === true && data.validatorPermit[i] === true) {
          validators.push({
            index: i,
            hotkey: data.hotkeys[i] || "unknown",
            coldkey: data.coldkeys[i] || "unknown",
          });
        }
      }

      return validators;
    } catch (error) {
      console.error("Error in getValidators:", error);
      throw error;
    }
  }
  // public async createStake({
  //   mnemonic,
  //   subnetId,
  //   validatorHotkey,
  //   amount,
  // }: {
  //   mnemonic: string;
  //   address: string;
  //   subnetId: number;
  //   validatorHotkey: string;
  //   amount: number;
  // }) {
  //   try {
  //     const amountInRao = BigInt(Math.floor(amount * 1e9));
  //     const account = await this.createAccount({
  //       mnemonic,
  //     });
  //     const stake = await this.api.tx.subtensorModule
  //       .addStake(validatorHotkey, subnetId, amountInRao)
  //       .signAndSend(account);
  //     return stake.hash;
  //   } catch (error) {
  //     console.error("Error in createStake:", error);
  //     throw error;
  //   }
  // }
}

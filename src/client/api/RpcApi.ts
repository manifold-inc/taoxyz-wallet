import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeyringService } from "../services/KeyringService";
import type { Subnet, Validator } from "../../types/subnets";

export class RpcApi {
  private api!: ApiPromise;
  private initPromise: Promise<void>;

  private readonly endpoint = {
    test: "wss://test.finney.opentensor.ai:443",
    main: "wss://entrypoint-finney.opentensor.ai:443",
  };

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log("[Client] Starting initialization");
    const provider = new WsProvider(this.endpoint.main);
    try {
      this.api = await ApiPromise.create({
        provider,
        throwOnConnect: true,
      });
      await this.api.isReady;
      console.log(`[Client] Connected to the endpoint: ${this.endpoint.main}`);
    } catch (error) {
      console.error("[Client] Failed to initialize the Bittensor API:", error);
      throw error;
    }
  }

  public async getApi(): Promise<ApiPromise> {
    await this.initPromise;
    if (!this.api) {
      console.error("[Client] API not initialized");
      throw new Error("API not initialized");
    }
    return this.api;
  }

  public async getStake(address: string) {
    try {
      const stake =
        await this.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address);
      console.log("[Client] Stake:", stake.toJSON());
      return stake.toJSON();
    } catch (error) {
      console.error("[Client] Failed to get stake:", error);
      throw error;
    }
  }

  public async createStake({
    address,
    subnetId,
    validatorHotkey,
    amount,
  }: {
    address: string;
    subnetId: number;
    validatorHotkey: string;
    amount: number;
  }) {
    try {
      const amountInRao = BigInt(Math.floor(amount * 1e9));
      const account = await KeyringService.getAccount(address);
      const stake = await this.api.tx.subtensorModule
        .addStake(validatorHotkey, subnetId, amountInRao)
        .signAndSend(account);
      return stake.hash;
    } catch (error) {
      console.error("[Client] Failed to create stake:", error);
      throw error;
    }
  }

  public async removeStake(
    address: string,
    validatorHotkey: string,
    subnetId: number,
    amount: number
  ) {
    try {
      const amountInRao = BigInt(Math.floor(amount * 1e9));
      const account = await KeyringService.getAccount(address);
      const stake = await this.api.tx.subtensorModule
        .removeStake(validatorHotkey, subnetId, amountInRao)
        .signAndSend(account);
      return stake.hash;
    } catch (error) {
      console.error("[Client] Failed to remove stake:", error);
      throw error;
    }
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

  public async getSubnets(): Promise<Subnet[]> {
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

          const subnet: Subnet = {
            id: info.netuid,
            name: subnetName,
            price: price,
          };
          return subnet;
        })
        .filter((subnet): subnet is Subnet => subnet !== null);

      return subnets;
    } catch (error) {
      console.error("Error in getSubnets:", error);
      throw error;
    }
  }

  public async getSubnetInfo(subnetId: number): Promise<any> {
    try {
      const subnetData =
        await this.api.call.subnetInfoRuntimeApi.getDynamicInfo(subnetId);
      return subnetData.toJSON() as any;
    } catch (error) {
      console.error("Error in getSubnetInfo:", error);
      throw error;
    }
  }

  public async getValidators(subnetId: number): Promise<Validator[]> {
    try {
      const metagraph = await this.api.call.subnetInfoRuntimeApi.getMetagraph(
        subnetId
      );
      const data = metagraph.toJSON() as any;
      if (!data || !data.coldkeys || !data.active || !data.validatorPermit) {
        throw new Error("Invalid metagraph data structure");
      }

      const validators: Validator[] = [];
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
}

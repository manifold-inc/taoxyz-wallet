import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeyringService } from "../services/KeyringService";

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
    const provider = new WsProvider(this.endpoint.test);
    try {
      this.api = await ApiPromise.create({
        provider,
        throwOnConnect: true,
      });
      await this.api.isReady;
      console.log(`[Client] Connected to the endpoint: ${this.endpoint.test}`);
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
}

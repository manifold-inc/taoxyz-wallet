import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeyringService } from "../services/KeyringService";
import type { Subnet, Validator } from "../../types/types";

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
      console.error("Error in initialize:", error);
      throw error;
    }
  }

  public async getApi(): Promise<ApiPromise> {
    await this.initPromise;
    if (!this.api) {
      console.error("Error in getApi");
      throw new Error("API not initialized");
    }
    return this.api;
  }

  public async getStake(address: string) {
    try {
      const stake =
        await this.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address);
      return stake.toJSON();
    } catch (error) {
      console.error("Error in getStake:", error);
      throw error;
    }
  }

  public async transfer({
    fromAddress,
    toAddress,
    amount,
    password,
  }: {
    fromAddress: string;
    toAddress: string;
    amount: number;
    password: string;
  }) {
    try {
      const account = await KeyringService.getAccount(fromAddress);
      if (!account) throw new Error("Account not found");

      account.decodePkcs8(password);
      if (account.isLocked) {
        throw new Error("Invalid password");
      }

      const amountInRao = BigInt(Math.floor(amount * 1e9));
      const transaction = await this.api.tx.balances
        .transferAllowDeath(toAddress, amountInRao)
        .signAndSend(account);

      return transaction.hash;
    } catch (error) {
      console.error("Error in transfer:", error);
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
      console.error("Error in createStake:", error);
      throw error;
    }
  }

  public async removeStake({
    address,
    validatorHotkey,
    subnetId,
    amount,
  }: {
    address: string;
    validatorHotkey: string;
    subnetId: number;
    amount: number;
  }) {
    try {
      const amountInRao = BigInt(Math.floor(amount * 1e9));
      const account = await KeyringService.getAccount(address);
      const stake = await this.api.tx.subtensorModule
        .removeStake(validatorHotkey, subnetId, amountInRao)
        .signAndSend(account);
      return stake.hash;
    } catch (error) {
      console.error("Error in removeStake:", error);
      throw error;
    }
  }

  public async moveStake({
    address,
    fromHotkey,
    toHotkey,
    fromSubnetId,
    toSubnetId,
    amount,
  }: {
    address: string;
    fromHotkey: string;
    toHotkey: string;
    fromSubnetId: number;
    toSubnetId: number;
    amount: number;
  }) {
    try {
      const amountInRao = BigInt(Math.floor(amount * 1e9));
      const account = await KeyringService.getAccount(address);
      const stake = await this.api.tx.subtensorModule
        .moveStake(fromHotkey, toHotkey, fromSubnetId, toSubnetId, amountInRao)
        .signAndSend(account);
      return stake.hash;
    } catch (error) {
      console.error("Error in moveStake:", error);
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
      const subnetsData =
        await this.api.call.subnetInfoRuntimeApi.getAllDynamicInfo();

      const subnets = (subnetsData.toJSON() as any[])
        .map((data) => {
          if (!data) return null;
          const subnetName = data.subnetName
            ? String.fromCharCode(...data.subnetName)
            : `Subnet ${data.netuid}`;

          const price =
            data.netuid === 0
              ? 1
              : data.taoIn && data.alphaIn && data.alphaIn > 0
              ? Number((data.taoIn / data.alphaIn).toFixed(4))
              : 0;

          const tokenSymbol = data.tokenSymbol
            ? String.fromCharCode(...data.tokenSymbol)
            : "TAO";

          const subnet: Subnet = {
            id: data.netuid,
            name: subnetName,
            price: price,
            tokenSymbol: tokenSymbol,
            ...data,
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

  public async getSubnet(subnetId: number): Promise<Subnet> {
    try {
      const result = await this.api.call.subnetInfoRuntimeApi.getDynamicInfo(
        subnetId
      );
      const subnetData = result.toJSON() as any;
      if (!subnetData) throw new Error("Could not find subnet");

      const subnetName = subnetData.subnetName
        ? String.fromCharCode(...subnetData.subnetName)
        : `Subnet ${subnetData.netuid}`;

      const price =
        subnetData.netuid === 0
          ? 1
          : subnetData.taoIn && subnetData.alphaIn && subnetData.alphaIn > 0
          ? Number((subnetData.taoIn / subnetData.alphaIn).toFixed(4))
          : 0;

      const tokenSymbol = subnetData.tokenSymbol
        ? String.fromCharCode(...subnetData.tokenSymbol)
        : "TAO";

      const subnet: Subnet = {
        id: subnetData.netuid,
        name: subnetName,
        price: price,
        tokenSymbol: tokenSymbol,
        ...subnetData,
      };
      return subnet;
    } catch (error) {
      console.error("Error in getSubnet:", error);
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

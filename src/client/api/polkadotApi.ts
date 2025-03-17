import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeyringService } from "../services/KeyringService";
import type {
  BittensorSubnet,
  BittensorMetagraph,
  Subnet,
  Validator,
  SubstrateAccount,
} from "../../types/client";

class PolkadotApi {
  private api!: ApiPromise;
  private initPromise: Promise<void>;
  private endpoint: "test" | "main";

  private readonly endpoints = {
    test: "wss://test.finney.opentensor.ai:443",
    main: "wss://entrypoint-finney.opentensor.ai:443",
  };

  constructor(endpoint: "test" | "main" = "test") {
    this.endpoint = endpoint;
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log("[Client] Starting initialization");
    const provider = new WsProvider(this.endpoints[this.endpoint]);
    try {
      if (this.api?.isConnected) {
        await this.api.disconnect();
      }

      this.api = await ApiPromise.create({ provider });
      console.log(
        `[Client] Connected to the endpoint: ${this.endpoints[this.endpoint]}`
      );
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

  public async changeEndpoint(newEndpoint: "test" | "main"): Promise<void> {
    this.endpoint = newEndpoint;
    await this.initialize();
  }

  public async transfer({
    fromAddress,
    toAddress,
    amount,
  }: {
    fromAddress: string;
    toAddress: string;
    amount: number;
  }) {
    try {
      const account = await KeyringService.getAccount(fromAddress);
      if (!account) throw new Error("Account not found");
      if (account.isLocked) throw new Error("Account is locked");

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

  // TODO: Relook at error handling for api
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
      const result = await this.api.query.system.account(address);
      const account = result.toJSON() as unknown as SubstrateAccount;
      const balanceInTao = (account.data.free / 1e9).toFixed(4);
      return balanceInTao;
    } catch (error) {
      console.error("Error in getBalance:", error);
      throw error;
    }
  }

  public async getSubnets(): Promise<Subnet[]> {
    try {
      const result =
        await this.api.call.subnetInfoRuntimeApi.getAllDynamicInfo();

      const btSubnets = (result.toJSON() as unknown as BittensorSubnet[])
        .map((btSubnet) => {
          if (!btSubnet) return null;
          const subnetName = btSubnet.subnetName
            ? String.fromCharCode(...btSubnet.subnetName)
            : `Subnet ${btSubnet.netuid}`;

          const price =
            btSubnet.netuid === 0
              ? 1
              : btSubnet.taoIn && btSubnet.alphaIn && btSubnet.alphaIn > 0
              ? Number((btSubnet.taoIn / btSubnet.alphaIn).toFixed(4))
              : 0;

          const tokenSymbol = btSubnet.tokenSymbol
            ? String.fromCharCode(...btSubnet.tokenSymbol)
            : "TAO";

          const subnet: Subnet = {
            ...btSubnet,
            id: btSubnet.netuid,
            name: subnetName,
            price: price,
            tokenSymbol: tokenSymbol,
          };
          return subnet;
        })
        .filter((subnet): subnet is Subnet => subnet !== null);

      return btSubnets;
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
      const btSubnet = result.toJSON() as unknown as BittensorSubnet;
      if (!btSubnet) throw new Error("Could not find subnet");

      const subnetName = btSubnet.subnetName
        ? String.fromCharCode(...btSubnet.subnetName)
        : `Subnet ${btSubnet.netuid}`;

      const price =
        btSubnet.netuid === 0
          ? 1
          : btSubnet.taoIn && btSubnet.alphaIn && btSubnet.alphaIn > 0
          ? Number((btSubnet.taoIn / btSubnet.alphaIn).toFixed(4))
          : 0;

      const tokenSymbol = btSubnet.tokenSymbol
        ? String.fromCharCode(...btSubnet.tokenSymbol)
        : "TAO";

      const subnet: Subnet = {
        ...btSubnet,
        id: btSubnet.netuid,
        name: subnetName,
        price: price,
        tokenSymbol: tokenSymbol,
      };
      return subnet;
    } catch (error) {
      console.error("Error in getSubnet:", error);
      throw error;
    }
  }

  public async getValidators(subnetId: number): Promise<Validator[]> {
    try {
      const result = await this.api.call.subnetInfoRuntimeApi.getMetagraph(
        subnetId
      );
      const btMetagraph = result.toJSON() as unknown as BittensorMetagraph;
      if (
        !btMetagraph ||
        !btMetagraph.coldkeys ||
        !btMetagraph.active ||
        !btMetagraph.validatorPermit
      ) {
        throw new Error("Invalid metagraph data structure");
      }

      const validators: Validator[] = [];
      for (let i = 0; i < btMetagraph.coldkeys.length; i++) {
        if (
          btMetagraph.active[i] === true &&
          btMetagraph.validatorPermit[i] === true
        ) {
          validators.push({
            index: i,
            hotkey: btMetagraph.hotkeys[i] || "unknown",
            coldkey: btMetagraph.coldkeys[i] || "unknown",
          });
        }
      }

      return validators;
    } catch (error) {
      console.error("Error in getValidators:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.api?.isConnected) {
      await this.api.disconnect();
    }
  }
}

export default PolkadotApi;

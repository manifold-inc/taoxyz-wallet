import { ApiPromise, WsProvider } from "@polkadot/api";

import KeyringService from "../services/KeyringService";

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
  private static instance: PolkadotApi;

  private readonly endpoints = {
    test: "wss://test.finney.opentensor.ai:443",
    main: "wss://entrypoint-finney.opentensor.ai:443",
  };

  private constructor() {
    this.initPromise = this.initialize();
  }

  public static getInstance(): PolkadotApi {
    if (!PolkadotApi.instance) {
      PolkadotApi.instance = new PolkadotApi();
    }
    return PolkadotApi.instance;
  }

  private async initialize(): Promise<void> {
    console.log("[Client] Starting initialization");
    const provider = new WsProvider(this.endpoints.test);
    try {
      if (this.api?.isConnected) {
        await this.api.disconnect();
      }

      this.api = await ApiPromise.create({ provider });
      console.log(`[Client] Connected to the endpoint: ${this.endpoints.test}`);
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

  // If trying to transfer entire balance use transferAll - possible implementation
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
      const wallet = await KeyringService.getWallet(fromAddress);
      const toWallet = (await this.api.query.system.account(
        toAddress
      )) as unknown as SubstrateAccount;

      if (wallet instanceof Error) throw new Error(wallet.message);
      if (wallet.isLocked) throw new Error("Wallet is locked");
      if (!toWallet.data.free) throw new Error("Invalid recipient address");

      const amountInRao = BigInt(Math.floor(amount * 1e9));
      const transaction = await this.api.tx.balances
        .transferAllowDeath(toAddress, amountInRao)
        .signAndSend(wallet);

      return transaction.hash.toHex();
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
  }): Promise<string> {
    try {
      const wallet = await KeyringService.getWallet(address);
      if (wallet instanceof Error) throw new Error(wallet.message);

      const amountInRao = BigInt(Math.floor(amount * 1e9));
      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | undefined;

        this.api.tx.subtensorModule
          .addStake(validatorHotkey, subnetId, amountInRao)
          .signAndSend(wallet, ({ status, dispatchError, events = [] }) => {
            // Only log state transitions
            if (status.isReady) console.log("[Transaction] Ready to broadcast");
            if (status.isBroadcast)
              console.log("[Transaction] Broadcasted to network");
            if (status.isInBlock)
              console.log(
                "[Transaction] Included in block:",
                status.asInBlock.toHex()
              );

            if (dispatchError) {
              if (unsubscribe) unsubscribe();
              reject(new Error(dispatchError.toString()));
              return;
            }

            if (status.isInBlock) {
              // Check if the transaction was successful
              const extrinsicFailed = events.find(
                ({ event }) => event.method === "ExtrinsicFailed"
              );
              if (extrinsicFailed) {
                if (unsubscribe) unsubscribe();
                reject(new Error("Transaction failed"));
                return;
              }

              const extrinsicSuccess = events.find(
                ({ event }) => event.method === "ExtrinsicSuccess"
              );
              if (extrinsicSuccess) {
                console.log("[Transaction] Successful");
                if (unsubscribe) unsubscribe();
                resolve(status.asInBlock.toHex());
              }
            }
          })
          .then((unsub) => {
            unsubscribe = unsub;
          })
          .catch((error) => {
            console.error("[Transaction] Error:", error);
            if (unsubscribe) unsubscribe();
            reject(error);
          });
      });
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
  }): Promise<string> {
    try {
      const wallet = await KeyringService.getWallet(address);
      if (wallet instanceof Error) throw new Error(wallet.message);

      const amountInRao = BigInt(Math.floor(amount * 1e9));
      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | undefined;
        this.api.tx.subtensorModule
          .removeStake(validatorHotkey, subnetId, amountInRao)
          .signAndSend(wallet, ({ status, dispatchError, events = [] }) => {
            if (dispatchError) {
              if (unsubscribe) unsubscribe();
              reject(new Error(dispatchError.toString()));
            } else if (status.isInBlock) {
              // Transaction is in a block
              events.forEach(({ event: { method } }) => {
                if (method === "ExtrinsicSuccess") {
                  // Transaction is successful but not yet finalized
                  console.log("Transaction in block");
                }
              });
            } else if (status.isFinalized) {
              // Transaction is finalized
              if (unsubscribe) unsubscribe();
              resolve(status.asFinalized.toHex());
            }
          })
          .then((unsub) => {
            unsubscribe = unsub;
          })
          .catch((error) => {
            if (unsubscribe) unsubscribe();
            reject(error);
          });
      });
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
  }): Promise<string> {
    try {
      const wallet = await KeyringService.getWallet(address);
      if (wallet instanceof Error) throw new Error(wallet.message);

      const amountInRao = BigInt(Math.floor(amount * 1e9));
      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | undefined;
        this.api.tx.subtensorModule
          .moveStake(
            fromHotkey,
            toHotkey,
            fromSubnetId,
            toSubnetId,
            amountInRao
          )
          .signAndSend(wallet, ({ status, dispatchError, events = [] }) => {
            // Only log state transitions
            if (status.isReady) console.log("[Transaction] Ready to broadcast");
            if (status.isBroadcast)
              console.log("[Transaction] Broadcasted to network");
            if (status.isInBlock)
              console.log(
                "[Transaction] Included in block:",
                status.asInBlock.toHex()
              );

            if (dispatchError) {
              if (unsubscribe) unsubscribe();
              reject(new Error(dispatchError.toString()));
              return;
            }

            if (status.isInBlock) {
              const extrinsicFailed = events.find(
                ({ event }) => event.method === "ExtrinsicFailed"
              );
              if (extrinsicFailed) {
                if (unsubscribe) unsubscribe();
                reject(new Error("Transaction failed"));
                return;
              }

              const extrinsicSuccess = events.find(
                ({ event }) => event.method === "ExtrinsicSuccess"
              );
              if (extrinsicSuccess) {
                console.log("[Transaction] Successful");
                if (unsubscribe) unsubscribe();
                resolve(status.asInBlock.toHex());
              }
            }
          })
          .then((unsub) => {
            unsubscribe = unsub;
          })
          .catch((error) => {
            console.error("[Transaction] Error:", error);
            if (unsubscribe) unsubscribe();
            reject(error);
          });
      });
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

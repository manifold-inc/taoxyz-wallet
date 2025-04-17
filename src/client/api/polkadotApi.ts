import { ApiPromise, WsProvider } from '@polkadot/api';
import type { EventRecord, ExtrinsicStatus } from '@polkadot/types/interfaces';
import type { ISubmittableResult } from '@polkadot/types/types';

import type {
  BittensorMetagraph,
  BittensorSubnet,
  Stake,
  Subnet,
  SubstrateAccount,
  Validator,
  ValidatorIdentity,
} from '../../types/client';
import KeyringService from '../services/KeyringService';

class PolkadotApi {
  private api!: ApiPromise;
  private initPromise: Promise<void>;
  private static instance: PolkadotApi;

  private readonly endpoints = {
    test: 'wss://test.finney.opentensor.ai:443',
    main: 'wss://entrypoint-finney.opentensor.ai:443',
  };

  private constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log('[Client] Initializing API');
    const provider = new WsProvider(this.endpoints.test);
    try {
      if (this.api?.isConnected) {
        await this.api.disconnect();
      }

      this.api = await ApiPromise.create({ provider });
      console.log(`[Client] Connected to Endpoint: ${this.endpoints.test}`);
    } catch (error) {
      console.error('Error in initialize:', error);
      throw error;
    }
  }

  public static getInstance(): PolkadotApi {
    if (!PolkadotApi.instance) {
      PolkadotApi.instance = new PolkadotApi();
    }
    return PolkadotApi.instance;
  }

  public async getApi(): Promise<ApiPromise> {
    await this.initPromise;
    if (!this.api) {
      throw new Error('API Not Initialized');
    }
    return this.api;
  }

  public async transfer({
    fromAddress,
    toAddress,
    amountInRao,
  }: {
    fromAddress: string;
    toAddress: string;
    amountInRao: bigint;
  }): Promise<string> {
    try {
      const wallet = await KeyringService.getWallet(fromAddress);
      const toWallet = (await this.api.query.system.account(
        toAddress
      )) as unknown as SubstrateAccount;

      if (wallet instanceof Error) throw new Error(wallet.message);
      if (wallet.isLocked) throw new Error('Wallet is Locked');
      if (!toWallet.data.free) throw new Error('Invalid Recipient Address');

      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | undefined;

        this.api.tx.balances
          .transferAllowDeath(toAddress, amountInRao)
          .signAndSend(wallet, {}, (result: ISubmittableResult) => {
            const { status, dispatchError, events = [] } = result;

            if (dispatchError) {
              if (unsubscribe) unsubscribe();
              reject(new Error(dispatchError.toString()));
              return;
            }

            if (unsubscribe) {
              this.handleTransactionStatus(status, events, unsubscribe, resolve, reject);
            }
          })
          .then(unsub => {
            unsubscribe = unsub;
          })
          .catch(error => {
            if (unsubscribe) unsubscribe();
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error in Transfer:', error);
      throw error;
    }
  }

  public async getStake(address: string): Promise<Stake[] | null> {
    try {
      const stake = await this.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address);
      return stake.toJSON() as unknown as Stake[];
    } catch (error) {
      console.error('Error in Get Stake:', error);
      return null;
    }
  }

  public async createStake({
    address,
    subnetId,
    validatorHotkey,
    amountInRao,
  }: {
    address: string;
    subnetId: number;
    validatorHotkey: string;
    amountInRao: bigint;
  }): Promise<string> {
    try {
      const wallet = await KeyringService.getWallet(address);
      if (wallet instanceof Error) throw new Error(wallet.message);

      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | undefined;

        this.api.tx.subtensorModule
          .addStake(validatorHotkey, subnetId, amountInRao)
          .signAndSend(wallet, {}, (result: ISubmittableResult) => {
            const { status, dispatchError, events = [] } = result;

            if (dispatchError) {
              if (unsubscribe) unsubscribe();
              reject(new Error(dispatchError.toString()));
              return;
            }

            if (unsubscribe) {
              this.handleTransactionStatus(status, events, unsubscribe, resolve, reject);
            }
          })
          .then(unsub => {
            unsubscribe = unsub;
          })
          .catch(error => {
            if (unsubscribe) unsubscribe();
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error in Create Stake:', error);
      throw error;
    }
  }

  public async removeStake({
    address,
    subnetId,
    validatorHotkey,
    amountInRao,
  }: {
    address: string;
    subnetId: number;
    validatorHotkey: string;
    amountInRao: bigint;
  }): Promise<string> {
    if (!this.api) throw new Error('API Not Initialized');

    try {
      const wallet = await KeyringService.getWallet(address);
      if (wallet instanceof Error) throw new Error(wallet.message);

      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | undefined;

        this.api.tx.subtensorModule
          .removeStake(validatorHotkey, subnetId, amountInRao)
          .signAndSend(wallet, {}, (result: ISubmittableResult) => {
            const { status, dispatchError, events = [] } = result;

            if (dispatchError) {
              if (unsubscribe) unsubscribe();
              reject(new Error(dispatchError.toString()));
              return;
            }

            if (unsubscribe) {
              this.handleTransactionStatus(status, events, unsubscribe, resolve, reject);
            }
          })
          .then(unsub => {
            unsubscribe = unsub;
          })
          .catch(error => {
            if (unsubscribe) unsubscribe();
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error in Remove Stake:', error);
      throw error;
    }
  }

  public async moveStake({
    address,
    fromHotkey,
    toHotkey,
    fromSubnetId,
    toSubnetId,
    amountInRao,
  }: {
    address: string;
    fromHotkey: string;
    toHotkey: string;
    fromSubnetId: number;
    toSubnetId: number;
    amountInRao: bigint;
  }): Promise<string> {
    try {
      const wallet = await KeyringService.getWallet(address);
      if (wallet instanceof Error) throw new Error(wallet.message);

      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | undefined;

        this.api.tx.subtensorModule
          .moveStake(fromHotkey, toHotkey, fromSubnetId, toSubnetId, amountInRao)
          .signAndSend(wallet, {}, (result: ISubmittableResult) => {
            const { status, dispatchError, events = [] } = result;

            if (dispatchError) {
              if (unsubscribe) unsubscribe();
              reject(new Error(dispatchError.toString()));
              return;
            }

            if (unsubscribe) {
              this.handleTransactionStatus(status, events, unsubscribe, resolve, reject);
            }
          })
          .then(unsub => {
            unsubscribe = unsub;
          })
          .catch(error => {
            if (unsubscribe) unsubscribe();
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error in Move Stake:', error);
      throw error;
    }
  }

  public async getBalance(address: string): Promise<bigint | null> {
    try {
      const result = await this.api.query.system.account(address);
      const account = result.toJSON() as unknown as SubstrateAccount;
      const balance = account.data.free;
      return BigInt(balance);
    } catch (error) {
      console.error('Error in Get Balance:', error);
      return null;
    }
  }

  public async getSubnets(): Promise<Subnet[] | null> {
    try {
      const result = await this.api.call.subnetInfoRuntimeApi.getAllDynamicInfo();

      const btSubnets = (result.toJSON() as unknown as BittensorSubnet[])
        .map(btSubnet => {
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
            : 'TAO';

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
      console.error('Error in Get Subnets:', error);
      return null;
    }
  }

  public async getSubnet(subnetId: number): Promise<Subnet> {
    try {
      const result = await this.api.call.subnetInfoRuntimeApi.getDynamicInfo(subnetId);
      const btSubnet = result.toJSON() as unknown as BittensorSubnet;
      if (!btSubnet) throw new Error('Could not find subnet');

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
        : 'TAO';

      const subnet: Subnet = {
        ...btSubnet,
        id: btSubnet.netuid,
        name: subnetName,
        price: price,
        tokenSymbol: tokenSymbol,
      };
      return subnet;
    } catch (error) {
      console.error('Error in Get Subnet:', error);
      throw error;
    }
  }

  public async getValidators(subnetId: number): Promise<Validator[] | null> {
    try {
      const result = await this.api.call.subnetInfoRuntimeApi.getMetagraph(subnetId);
      const btMetagraph = result.toJSON() as unknown as BittensorMetagraph;
      if (
        !btMetagraph ||
        !btMetagraph.coldkeys ||
        !btMetagraph.active ||
        !btMetagraph.validatorPermit
      ) {
        throw new Error('Invalid Metagraph');
      }

      const validators: Validator[] = [];
      for (let i = 0; i < btMetagraph.coldkeys.length; i++) {
        if (btMetagraph.active[i] === true && btMetagraph.validatorPermit[i] === true) {
          let name = null;
          const identity = btMetagraph.identities[i] as unknown as ValidatorIdentity;
          if (identity) {
            const hexString = identity.name.replace('0x', '');
            const bytes = new Uint8Array(
              hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
            );
            name = new TextDecoder().decode(bytes);
          }

          validators.push({
            index: i,
            hotkey: btMetagraph.hotkeys[i] || 'unknown',
            coldkey: btMetagraph.coldkeys[i] || 'unknown',
            name: name,
          });
        }
      }

      return validators;
    } catch (error) {
      console.error('Error in Get Validators:', error);
      return null;
    }
  }

  private handleTransactionStatus(
    status: ExtrinsicStatus,
    events: EventRecord[],
    unsubscribe: () => void,
    resolve: (value: string) => void,
    reject: (reason: Error) => void
  ): void {
    switch (true) {
      case status.isReady:
        break;
      case status.isBroadcast:
        break;
      case status.isInBlock: {
        const extrinsicFailed = events.find(({ event }) => event.method === 'ExtrinsicFailed');
        if (extrinsicFailed) {
          unsubscribe();
          reject(new Error('Transaction failed'));
          return;
        }

        const extrinsicSuccess = events.find(({ event }) => event.method === 'ExtrinsicSuccess');
        if (extrinsicSuccess) {
          unsubscribe();
          resolve(status.asInBlock.toHex());
        }
        break;
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.api?.isConnected) {
      await this.api.disconnect();
    }
  }
}

export default PolkadotApi;

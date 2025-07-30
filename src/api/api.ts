import { ApiPromise, WsProvider } from '@polkadot/api';

import { createBalanceAPI } from '@/api/api/BalanceAPI';
import { createStakeAPI } from '@/api/api/StakeAPI';
import { createSubnetPriceAPI } from '@/api/api/SubnetPriceAPI';
import { createTaoPriceAPI } from '@/api/api/TaoPriceAPI';
import { createValidatorsAPI } from '@/api/api/ValidatorsAPI';

import { createSubnetsAPI } from './api/SubnetsAPI';

const ENDPOINTS = {
  main: 'wss://entrypoint-finney.opentensor.ai:443',
  test: 'wss://test.finney.opentensor.ai:443',
};

class ApiManager {
  private static instance: ApiManager;
  private api: ApiPromise | null = null;
  private initPromise: Promise<void> | null = null;

  public balance = createBalanceAPI(() => this.getApi());
  public subnets = createSubnetsAPI(() => this.getApi());
  public stakes = createStakeAPI(() => this.getApi());
  public validators = createValidatorsAPI(() => this.getApi());
  public taoPrice = createTaoPriceAPI();
  public subnetPrice = createSubnetPriceAPI();

  public static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  private async initialize(): Promise<void> {
    if (this.api?.isConnected) {
      await this.api.disconnect();
    }

    try {
      const provider = new WsProvider(ENDPOINTS.test);
      this.api = await ApiPromise.create({ provider });
      console.log('[ApiManager] Connected to Endpoint: ', ENDPOINTS.test);
    } catch (error) {
      console.error('[ApiManager] Failed to Connect to Endpoint: ', ENDPOINTS.test, error);
      this.api = null;
      this.initPromise = null;
      throw error;
    }
  }

  public async getApi(): Promise<ApiPromise> {
    if (this.api?.isConnected) {
      console.log('[ApiManager] Already connected to Endpoint: ', ENDPOINTS.test);
      return this.api;
    }

    if (this.initPromise) {
      try {
        await this.initPromise;
      } catch (error) {
        this.api = null;
        this.initPromise = null;
        throw error;
      }
      if (!this.api) throw new Error('[ApiManager] API Failed to Initialize');
      return this.api;
    }

    this.initPromise = this.initialize();
    try {
      await this.initPromise;
    } catch (error) {
      this.api = null;
      this.initPromise = null;
      throw error;
    }
    if (!this.api) throw new Error('[ApiManager] API Failed to Initialize');
    return this.api;
  }

  public async disconnect(): Promise<void> {
    if (this.api?.isConnected) {
      await this.api.disconnect();
      this.api = null;
      this.initPromise = null;
      console.log('[ApiManager] Disconnected');
    } else {
      console.error('[ApiManager] Connection not Established');
    }
  }
}

// TODO: Rename this to api once polkadot is fully replaced
export const newApi = ApiManager.getInstance();

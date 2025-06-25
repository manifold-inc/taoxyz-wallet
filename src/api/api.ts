import { ApiPromise, WsProvider } from '@polkadot/api';

const ENDPOINTS = {
  main: 'wss://entrypoint-finney.opentensor.ai:443',
  test: 'wss://test.finney.opentensor.ai:443',
};

class ApiManager {
  private static instance: ApiManager;
  private api: ApiPromise | null = null;
  private initPromise: Promise<void> | null = null;

  public static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  public async getApi(): Promise<ApiPromise> {
    if (this.api?.isConnected) {
      console.log('[ApiManager] Already connected to Endpoint: ', ENDPOINTS.main);
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

  private async initialize(): Promise<void> {
    if (this.api?.isConnected) {
      console.log('[ApiManager] Clearing Connection');
      await this.api.disconnect();
    }

    try {
      console.log('[ApiManager] Connecting to Endpoint: ', ENDPOINTS.main);
      const provider = new WsProvider(ENDPOINTS.main);
      this.api = await ApiPromise.create({ provider });
      console.log('[ApiManager] Connected to Endpoint: ', ENDPOINTS.main);
    } catch (error) {
      console.error('[ApiManager] Failed to Connect to Endpoint: ', ENDPOINTS.main, error);
      this.api = null;
      this.initPromise = null;
      throw error;
    }
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

export const apiManager = ApiManager.getInstance();

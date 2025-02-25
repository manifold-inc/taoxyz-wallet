import { ApiPromise, WsProvider } from "@polkadot/api";

// Handles blockchain-specific operations:
// - RPC calls to nodes
// - Query account balances/nonces
// - Submit signed transactions
// - Track transaction status
// - Staking operations
// - Network-specific formatting
// - Handle network responses/errors

export class BittensorService {
  private api: ApiPromise | null = null;
  private provider: WsProvider | null = null;

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
    if (!this.api) {
      throw new Error("The Bittensor service API is not initialized");
    }
    return this.api;
  }

  // RPC Calls
  // TODO: Abstract conversion?
  public async getBalance(address: string): Promise<string> {
    const api = await this.getApi();
    const accountBalance = await api.query["system"]["account"](address);
    const {
      data: { free },
    } = accountBalance.toJSON() as any;

    const balanceInTao = (free / 1e9).toFixed(4);
    return balanceInTao;
  }
}

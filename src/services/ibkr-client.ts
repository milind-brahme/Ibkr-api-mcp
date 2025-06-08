import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  IBKRConfig, 
  AuthResponse, 
  MarketDataSnapshot, 
  Contract,
  Position,
  Account,
  OrderRequest,
  OrderResponse,
  HistoricalData,
  AccountSummary,
  ScannerResult
} from '../types/ibkr.js';

export class IBKRClient {
  private client: AxiosInstance;
  private config: IBKRConfig;
  private isAuthenticated: boolean = false;

  constructor(config: IBKRConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      withCredentials: true,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.isAuthenticated = false;
        }
        throw error;
      }
    );
  }

  // Authentication Methods
  async authenticate(): Promise<AuthResponse> {
    try {
      const response = await this.client.post('/v1/api/iserver/auth/status');
      const authData = response.data;
      this.isAuthenticated = authData.authenticated;
      return authData;
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async reauthenticate(): Promise<AuthResponse> {
    try {
      const response = await this.client.post('/v1/api/iserver/reauthenticate');
      const authData = response.data;
      this.isAuthenticated = authData.authenticated;
      return authData;
    } catch (error) {
      throw new Error(`Reauthentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<boolean> {
    try {
      await this.client.post('/v1/api/logout');
      this.isAuthenticated = false;
      return true;
    } catch (error) {
      throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Account Methods
  async getAccounts(): Promise<Account[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.client.get('/v1/api/iserver/accounts');
      return response.data.accounts || response.data;
    } catch (error) {
      throw new Error(`Failed to get accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAccountSummary(accountId: string): Promise<AccountSummary> {
    this.ensureAuthenticated();
    try {
      const response = await this.client.get(`/v1/api/portfolio/${accountId}/summary`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get account summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPositions(accountId: string): Promise<Position[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.client.get(`/v1/api/portfolio/${accountId}/positions/0`);
      return response.data || [];
    } catch (error) {
      throw new Error(`Failed to get positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Market Data Methods
  async searchContracts(symbol: string): Promise<Contract[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.client.get(`/v1/api/iserver/secdef/search`, {
        params: { symbol }
      });
      return response.data || [];
    } catch (error) {
      throw new Error(`Failed to search contracts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMarketDataSnapshot(conids: number[]): Promise<MarketDataSnapshot[]> {
    this.ensureAuthenticated();
    try {
      const conidsStr = conids.join(',');
      const response = await this.client.get(`/v1/api/iserver/marketdata/snapshot`, {
        params: { conids: conidsStr }
      });
      return response.data || [];
    } catch (error) {
      throw new Error(`Failed to get market data snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getHistoricalData(
    conid: number, 
    period: string = '1d', 
    bar: string = '1min'
  ): Promise<HistoricalData> {
    this.ensureAuthenticated();
    try {
      const response = await this.client.get(`/v1/api/iserver/marketdata/history`, {
        params: { conid, period, bar }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get historical data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Trading Methods
  async placeOrder(accountId: string, order: OrderRequest): Promise<OrderResponse> {
    this.ensureAuthenticated();
    try {
      const response = await this.client.post(`/v1/api/iserver/account/${accountId}/orders`, {
        orders: [order]
      });
      return response.data[0] || response.data;
    } catch (error) {
      throw new Error(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOrders(): Promise<any[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.client.get('/v1/api/iserver/account/orders');
      return response.data.orders || response.data;
    } catch (error) {
      throw new Error(`Failed to get orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cancelOrder(accountId: string, orderId: string): Promise<boolean> {
    this.ensureAuthenticated();
    try {
      await this.client.delete(`/v1/api/iserver/account/${accountId}/order/${orderId}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Scanner Methods
  async getMarketScanner(type: string = 'TOP_PERC_GAIN'): Promise<ScannerResult[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.client.get('/v1/api/iserver/scanner/run', {
        params: {
          type,
          filters: '',
          location: 'STK.US.MAJOR',
          size: '25'
        }
      });
      return response.data.contracts || [];
    } catch (error) {
      throw new Error(`Failed to get market scanner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility Methods
  private ensureAuthenticated(): void {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please authenticate first.');
    }
  }

  getAuthenticationStatus(): boolean {
    return this.isAuthenticated;
  }
}
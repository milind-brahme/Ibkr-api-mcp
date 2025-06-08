import { IBKRClient } from '../services/ibkr-client.js';
import { IBKRConfig } from '../types/ibkr.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IBKRClient', () => {
  let client: IBKRClient;
  let mockAxiosInstance: jest.Mocked<any>;

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const config: IBKRConfig = {
      baseUrl: 'https://localhost:5000',
      gateway: 'https://localhost:5000',
    };

    client = new IBKRClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should authenticate successfully', async () => {
      const mockAuthResponse = {
        authenticated: true,
        competing: false,
        connected: true,
        message: 'success',
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await client.authenticate();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/api/iserver/auth/status');
      expect(result).toEqual(mockAuthResponse);
      expect(client.getAuthenticationStatus()).toBe(true);
    });

    it('should handle authentication failure', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      await expect(client.authenticate()).rejects.toThrow('Authentication failed: Network error');
      expect(client.getAuthenticationStatus()).toBe(false);
    });

    it('should reauthenticate successfully', async () => {
      const mockReauthResponse = {
        authenticated: true,
        competing: false,
        connected: true,
        message: 'reauthenticated',
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockReauthResponse });

      const result = await client.reauthenticate();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/api/iserver/reauthenticate');
      expect(result).toEqual(mockReauthResponse);
    });

    it('should logout successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      const result = await client.logout();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/api/logout');
      expect(result).toBe(true);
      expect(client.getAuthenticationStatus()).toBe(false);
    });
  });

  describe('Market Data', () => {
    beforeEach(() => {
      // Set authentication status to true for market data tests
      (client as any).isAuthenticated = true;
    });

    it('should search contracts successfully', async () => {
      const mockContracts = [
        {
          conid: 265598,
          symbol: 'AAPL',
          secType: 'STK',
          exchange: 'NASDAQ',
          currency: 'USD',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockContracts });

      const result = await client.searchContracts('AAPL');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/api/iserver/secdef/search', {
        params: { symbol: 'AAPL' },
      });
      expect(result).toEqual(mockContracts);
    });

    it('should get market data snapshot', async () => {
      const mockSnapshot = [
        {
          conid: 265598,
          bid: 150.25,
          ask: 150.30,
          last: 150.27,
          volume: 1000000,
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockSnapshot });

      const result = await client.getMarketDataSnapshot([265598]);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/api/iserver/marketdata/snapshot', {
        params: { conids: '265598' },
      });
      expect(result).toEqual(mockSnapshot);
    });

    it('should get historical data', async () => {
      const mockHistoricalData = {
        symbol: 'AAPL',
        data: [
          { o: 150, h: 151, l: 149, c: 150.5, v: 1000, t: 1625097600 },
        ],
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockHistoricalData });

      const result = await client.getHistoricalData(265598, '1d', '1min');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/api/iserver/marketdata/history', {
        params: { conid: 265598, period: '1d', bar: '1min' },
      });
      expect(result).toEqual(mockHistoricalData);
    });

    it('should throw error when not authenticated', async () => {
      (client as any).isAuthenticated = false;

      await expect(client.searchContracts('AAPL')).rejects.toThrow('Not authenticated. Please authenticate first.');
    });
  });

  describe('Trading', () => {
    beforeEach(() => {
      (client as any).isAuthenticated = true;
    });

    it('should place order successfully', async () => {
      const mockOrderResponse = {
        orderId: '12345',
        orderStatus: 'Submitted',
      };

      mockAxiosInstance.post.mockResolvedValue({ data: [mockOrderResponse] });

      const orderRequest = {
        conid: 265598,
        orderType: 'MKT' as const,
        side: 'BUY' as const,
        quantity: 100,
      };

      const result = await client.placeOrder('DU123456', orderRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/api/iserver/account/DU123456/orders', {
        orders: [orderRequest],
      });
      expect(result).toEqual(mockOrderResponse);
    });

    it('should get orders successfully', async () => {
      const mockOrders = [
        {
          orderId: '12345',
          status: 'Submitted',
          symbol: 'AAPL',
          quantity: 100,
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: { orders: mockOrders } });

      const result = await client.getOrders();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/api/iserver/account/orders');
      expect(result).toEqual(mockOrders);
    });

    it('should cancel order successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: {} });

      const result = await client.cancelOrder('DU123456', '12345');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/v1/api/iserver/account/DU123456/order/12345');
      expect(result).toBe(true);
    });
  });

  describe('Account Operations', () => {
    beforeEach(() => {
      (client as any).isAuthenticated = true;
    });

    it('should get accounts successfully', async () => {
      const mockAccounts = [
        {
          id: 'DU123456',
          accountVan: 'DU123456',
          accountTitle: 'Test Account',
          model: 'DEMO',
          tag: 'DU123456',
          faclient: false,
          covestor: false,
          desc: 'Demo Account',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: { accounts: mockAccounts } });

      const result = await client.getAccounts();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/api/iserver/accounts');
      expect(result).toEqual(mockAccounts);
    });

    it('should get positions successfully', async () => {
      const mockPositions = [
        {
          accountId: 'DU123456',
          conid: 265598,
          contractDesc: 'AAPL',
          position: 100,
          mktPrice: 150.27,
          mktValue: 15027,
          currency: 'USD',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockPositions });

      const result = await client.getPositions('DU123456');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/api/portfolio/DU123456/positions/0');
      expect(result).toEqual(mockPositions);
    });
  });
});
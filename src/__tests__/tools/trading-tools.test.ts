import { handleTradingTool } from '../../tools/trading-tools.js';
import { IBKRClient } from '../../services/ibkr-client.js';

// Mock IBKRClient
jest.mock('../../services/ibkr-client.js');

describe('Trading Tools', () => {
  let mockIBKRClient: jest.Mocked<IBKRClient>;

  beforeEach(() => {
    mockIBKRClient = {
      searchContracts: jest.fn(),
      placeOrder: jest.fn(),
      cancelOrder: jest.fn(),
      getOrders: jest.fn(),
      getPositions: jest.fn(),
      getAccounts: jest.fn(),
      getAccountSummary: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('place_order', () => {
    it('should place a market order successfully', async () => {
      const mockContracts = [{ conid: 265598, symbol: 'AAPL' }];
      const mockOrderResponse = { orderId: '12345', orderStatus: 'Submitted' };

      mockIBKRClient.searchContracts.mockResolvedValue(mockContracts);
      mockIBKRClient.placeOrder.mockResolvedValue(mockOrderResponse);

      const args = {
        accountId: 'DU123456',
        symbol: 'AAPL',
        orderType: 'MKT',
        side: 'BUY',
        quantity: 100,
      };

      const result = await handleTradingTool('place_order', args, mockIBKRClient);

      expect(mockIBKRClient.searchContracts).toHaveBeenCalledWith('AAPL');
      expect(mockIBKRClient.placeOrder).toHaveBeenCalledWith('DU123456', {
        conid: 265598,
        orderType: 'MKT',
        side: 'BUY',
        quantity: 100,
        tif: 'DAY',
      });
      expect(result).toEqual(mockOrderResponse);
    });

    it('should throw error if no contracts found', async () => {
      mockIBKRClient.searchContracts.mockResolvedValue([]);

      const args = {
        accountId: 'DU123456',
        symbol: 'INVALID',
        orderType: 'MKT',
        side: 'BUY',
        quantity: 100,
      };

      await expect(handleTradingTool('place_order', args, mockIBKRClient)).rejects.toThrow(
        'No contracts found for symbol: INVALID'
      );
    });
  });

  describe('get_positions', () => {
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

      mockIBKRClient.getPositions.mockResolvedValue(mockPositions);

      const args = { accountId: 'DU123456' };
      const result = await handleTradingTool('get_positions', args, mockIBKRClient);

      expect(mockIBKRClient.getPositions).toHaveBeenCalledWith('DU123456');
      expect(result).toEqual(mockPositions);
    });
  });

  describe('cancel_order', () => {
    it('should cancel order successfully', async () => {
      mockIBKRClient.cancelOrder.mockResolvedValue(true);

      const args = { accountId: 'DU123456', orderId: '12345' };
      const result = await handleTradingTool('cancel_order', args, mockIBKRClient);

      expect(mockIBKRClient.cancelOrder).toHaveBeenCalledWith('DU123456', '12345');
      expect(result).toBe(true);
    });
  });

  it('should throw error for unknown tool', async () => {
    await expect(handleTradingTool('unknown_tool', {}, mockIBKRClient)).rejects.toThrow(
      'Unknown trading tool: unknown_tool'
    );
  });
});
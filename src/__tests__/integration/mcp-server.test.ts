import { authTools } from '../../tools/auth-tools.js';
import { tradingTools } from '../../tools/trading-tools.js';
import { marketDataTools } from '../../tools/market-data-tools.js';

// Mock dependencies
jest.mock('../../services/ibkr-client.js');

describe('MCP Server Integration', () => {
  beforeEach(() => {
    // Setup for potential future tests
  });

  it('should have all required auth tools', () => {
    const expectedAuthTools = [
      'authenticate',
      'reauthenticate', 
      'logout',
      'get_auth_status'
    ];
    
    const authToolNames = authTools.map(tool => tool.name);
    expectedAuthTools.forEach(toolName => {
      expect(authToolNames).toContain(toolName);
    });
  });

  it('should have all required trading tools', () => {
    const expectedTradingTools = [
      'place_order',
      'cancel_order',
      'get_orders',
      'get_positions',
      'get_accounts',
      'get_account_summary'
    ];
    
    const tradingToolNames = tradingTools.map(tool => tool.name);
    expectedTradingTools.forEach(toolName => {
      expect(tradingToolNames).toContain(toolName);
    });
  });

  it('should have all required market data tools', () => {
    const expectedMarketDataTools = [
      'search_contracts',
      'get_market_data',
      'get_historical_data',
      'get_market_scanner'
    ];
    
    const marketDataToolNames = marketDataTools.map(tool => tool.name);
    expectedMarketDataTools.forEach(toolName => {
      expect(marketDataToolNames).toContain(toolName);
    });
  });

  it('should have proper input schemas for all tools', () => {
    const allTools = [...authTools, ...tradingTools, ...marketDataTools];
    
    allTools.forEach(tool => {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toBeDefined();
    });
  });
});
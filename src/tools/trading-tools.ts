import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { IBKRClient } from '../services/ibkr-client.js';

export const tradingTools: Tool[] = [
  {
    name: 'place_order',
    description: 'Place a trading order through IBKR',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'Account ID for the order',
        },
        symbol: {
          type: 'string',
          description: 'Symbol to trade',
        },
        orderType: {
          type: 'string',
          enum: ['MKT', 'LMT', 'STP', 'STOP_LIMIT'],
          description: 'Order type',
        },
        side: {
          type: 'string',
          enum: ['BUY', 'SELL'],
          description: 'Order side',
        },
        quantity: {
          type: 'number',
          minimum: 1,
          description: 'Order quantity',
        },
        price: {
          type: 'number',
          description: 'Limit price (required for LMT orders)',
        },
        auxPrice: {
          type: 'number',
          description: 'Stop price (required for STP orders)',
        },
        tif: {
          type: 'string',
          enum: ['GTC', 'DAY', 'IOC', 'FOK'],
          description: 'Time in force',
        },
      },
      required: ['accountId', 'symbol', 'orderType', 'side', 'quantity'],
    },
  },
  {
    name: 'cancel_order',
    description: 'Cancel an existing order',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'Account ID',
        },
        orderId: {
          type: 'string',
          description: 'Order ID to cancel',
        },
      },
      required: ['accountId', 'orderId'],
    },
  },
  {
    name: 'get_orders',
    description: 'Get all active orders',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_positions',
    description: 'Get current positions for an account',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'Account ID to get positions for',
        },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'get_accounts',
    description: 'Get all available trading accounts',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_account_summary',
    description: 'Get account summary including balances',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'Account ID to get summary for',
        },
      },
      required: ['accountId'],
    },
  },
];

export async function handleTradingTool(
  name: string,
  args: any,
  ibkrClient: IBKRClient
): Promise<any> {
  switch (name) {
    case 'place_order': {
      const { accountId, symbol, orderType, side, quantity, price, auxPrice, tif } = args;
      
      // First, search for the contract
      const contracts = await ibkrClient.searchContracts(symbol);
      if (contracts.length === 0) {
        throw new Error(`No contracts found for symbol: ${symbol}`);
      }
      
      const contract = contracts[0];
      const order = {
        conid: contract.conid,
        orderType,
        side,
        quantity,
        price,
        auxPrice,
        tif: tif || 'DAY',
      };
      
      return await ibkrClient.placeOrder(accountId, order);
    }
    
    case 'cancel_order': {
      const { accountId, orderId } = args;
      return await ibkrClient.cancelOrder(accountId, orderId);
    }
    
    case 'get_orders': {
      return await ibkrClient.getOrders();
    }
    
    case 'get_positions': {
      const { accountId } = args;
      return await ibkrClient.getPositions(accountId);
    }
    
    case 'get_accounts': {
      return await ibkrClient.getAccounts();
    }
    
    case 'get_account_summary': {
      const { accountId } = args;
      return await ibkrClient.getAccountSummary(accountId);
    }
    
    default:
      throw new Error(`Unknown trading tool: ${name}`);
  }
}
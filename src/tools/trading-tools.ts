import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { IBKRClient } from '../services/ibkr-client.js';

const PlaceOrderSchema = z.object({
  accountId: z.string().describe('Account ID for the order'),
  symbol: z.string().describe('Symbol to trade'),
  orderType: z.enum(['MKT', 'LMT', 'STP', 'STOP_LIMIT']).describe('Order type'),
  side: z.enum(['BUY', 'SELL']).describe('Order side'),
  quantity: z.number().positive().describe('Order quantity'),
  price: z.number().optional().describe('Limit price (required for LMT orders)'),
  auxPrice: z.number().optional().describe('Stop price (required for STP orders)'),
  tif: z.enum(['GTC', 'DAY', 'IOC', 'FOK']).optional().describe('Time in force'),
});

const CancelOrderSchema = z.object({
  accountId: z.string().describe('Account ID'),
  orderId: z.string().describe('Order ID to cancel'),
});

const GetPositionsSchema = z.object({
  accountId: z.string().describe('Account ID to get positions for'),
});

const GetAccountSummarySchema = z.object({
  accountId: z.string().describe('Account ID to get summary for'),
});

export const tradingTools: Tool[] = [
  {
    name: 'place_order',
    description: 'Place a trading order through IBKR',
    inputSchema: PlaceOrderSchema,
  },
  {
    name: 'cancel_order',
    description: 'Cancel an existing order',
    inputSchema: CancelOrderSchema,
  },
  {
    name: 'get_orders',
    description: 'Get all active orders',
    inputSchema: z.object({}),
  },
  {
    name: 'get_positions',
    description: 'Get current positions for an account',
    inputSchema: GetPositionsSchema,
  },
  {
    name: 'get_accounts',
    description: 'Get all available trading accounts',
    inputSchema: z.object({}),
  },
  {
    name: 'get_account_summary',
    description: 'Get account summary including balances',
    inputSchema: GetAccountSummarySchema,
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
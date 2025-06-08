import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { IBKRClient } from '../services/ibkr-client.js';

const SearchContractsSchema = z.object({
  symbol: z.string().describe('Symbol to search for'),
});

const GetMarketDataSchema = z.object({
  symbols: z.array(z.string()).describe('Array of symbols to get market data for'),
});

const GetHistoricalDataSchema = z.object({
  symbol: z.string().describe('Symbol to get historical data for'),
  period: z.string().optional().describe('Time period (1d, 7d, 1m, 3m, 6m, 1y, 2y, 5y)'),
  bar: z.string().optional().describe('Bar size (1min, 5min, 15min, 30min, 1h, 1d, 1w, 1m)'),
});

const GetMarketScannerSchema = z.object({
  scanType: z.string().optional().describe('Scanner type (TOP_PERC_GAIN, TOP_PERC_LOSE, MOST_ACTIVE, etc.)'),
});

export const marketDataTools: Tool[] = [
  {
    name: 'search_contracts',
    description: 'Search for contracts by symbol',
    inputSchema: SearchContractsSchema,
  },
  {
    name: 'get_market_data',
    description: 'Get real-time market data snapshots for symbols',
    inputSchema: GetMarketDataSchema,
  },
  {
    name: 'get_historical_data',
    description: 'Get historical price data for a symbol',
    inputSchema: GetHistoricalDataSchema,
  },
  {
    name: 'get_market_scanner',
    description: 'Get market scanner results (top gainers, losers, etc.)',
    inputSchema: GetMarketScannerSchema,
  },
];

export async function handleMarketDataTool(
  name: string,
  args: any,
  ibkrClient: IBKRClient
): Promise<any> {
  switch (name) {
    case 'search_contracts': {
      const { symbol } = args;
      return await ibkrClient.searchContracts(symbol);
    }
    
    case 'get_market_data': {
      const { symbols } = args;
      const allConids: number[] = [];
      
      // Search for all contracts
      for (const symbol of symbols) {
        const contracts = await ibkrClient.searchContracts(symbol);
        if (contracts.length > 0) {
          allConids.push(contracts[0].conid);
        }
      }
      
      if (allConids.length === 0) {
        throw new Error('No contracts found for the provided symbols');
      }
      
      return await ibkrClient.getMarketDataSnapshot(allConids);
    }
    
    case 'get_historical_data': {
      const { symbol, period = '1d', bar = '1min' } = args;
      
      // First search for the contract
      const contracts = await ibkrClient.searchContracts(symbol);
      if (contracts.length === 0) {
        throw new Error(`No contracts found for symbol: ${symbol}`);
      }
      
      const contract = contracts[0];
      return await ibkrClient.getHistoricalData(contract.conid, period, bar);
    }
    
    case 'get_market_scanner': {
      const { scanType = 'TOP_PERC_GAIN' } = args;
      return await ibkrClient.getMarketScanner(scanType);
    }
    
    default:
      throw new Error(`Unknown market data tool: ${name}`);
  }
}
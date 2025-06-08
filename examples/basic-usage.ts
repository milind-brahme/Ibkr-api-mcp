#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function main() {
  // Start the MCP server
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // Create MCP client
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
  });

  const client = new Client(
    {
      name: 'ibkr-example-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    console.log('Connected to IBKR MCP Server');

    // 1. Authenticate
    console.log('\n1. Authenticating...');
    const authResult = await client.request(
      { method: 'tools/call', params: { name: 'authenticate', arguments: {} } }
    );
    console.log('Auth result:', authResult);

    // 2. Get accounts
    console.log('\n2. Getting accounts...');
    const accounts = await client.request(
      { method: 'tools/call', params: { name: 'get_accounts', arguments: {} } }
    );
    console.log('Accounts:', accounts);

    // 3. Search for a contract
    console.log('\n3. Searching for AAPL contract...');
    const contracts = await client.request(
      { method: 'tools/call', params: { name: 'search_contracts', arguments: { symbol: 'AAPL' } } }
    );
    console.log('Contracts:', contracts);

    // 4. Get market data
    console.log('\n4. Getting market data...');
    const marketData = await client.request(
      { method: 'tools/call', params: { name: 'get_market_data', arguments: { symbols: ['AAPL'] } } }
    );
    console.log('Market data:', marketData);

    // 5. Get historical data
    console.log('\n5. Getting historical data...');
    const historicalData = await client.request(
      { method: 'tools/call', params: { 
        name: 'get_historical_data', 
        arguments: { 
          symbol: 'AAPL',
          period: '1d',
          bar: '5min'
        } 
      } }
    );
    console.log('Historical data:', historicalData);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    serverProcess.kill();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
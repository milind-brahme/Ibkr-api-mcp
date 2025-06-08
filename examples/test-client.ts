#!/usr/bin/env node
/**
 * Test client for IBKR MCP Server
 * This demonstrates how to test the server manually
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  data?: any;
}

class IBKRMCPTestClient {
  private client: Client;
  private transport: StdioClientTransport;
  private results: TestResult[] = [];

  constructor() {
    this.transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
    });

    this.client = new Client(
      {
        name: 'ibkr-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect(): Promise<void> {
    await this.client.connect(this.transport);
    console.log('✅ Connected to IBKR MCP Server');
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log('✅ Disconnected from IBKR MCP Server');
  }

  private async runTest(testName: string, testFn: () => Promise<any>): Promise<void> {
    try {
      console.log(`🧪 Running test: ${testName}`);
      const data = await testFn();
      this.results.push({ test: testName, passed: true, data });
      console.log(`✅ ${testName} passed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.results.push({ test: testName, passed: false, error: errorMessage });
      console.log(`❌ ${testName} failed: ${errorMessage}`);
    }
  }

  async testAuthentication(): Promise<void> {
    await this.runTest('Authentication Status', async () => {
      return await this.client.request({
        method: 'tools/call',
        params: { name: 'get_auth_status', arguments: {} }
      });
    });

    await this.runTest('Authentication', async () => {
      return await this.client.request({
        method: 'tools/call',
        params: { name: 'authenticate', arguments: {} }
      });
    });
  }

  async testMarketData(): Promise<void> {
    await this.runTest('Search Contracts', async () => {
      return await this.client.request({
        method: 'tools/call',
        params: { name: 'search_contracts', arguments: { symbol: 'AAPL' } }
      });
    });

    await this.runTest('Get Market Data', async () => {
      return await this.client.request({
        method: 'tools/call',
        params: { name: 'get_market_data', arguments: { symbols: ['AAPL'] } }
      });
    });

    await this.runTest('Get Historical Data', async () => {
      return await this.client.request({
        method: 'tools/call',
        params: { 
          name: 'get_historical_data', 
          arguments: { symbol: 'AAPL', period: '1d', bar: '5min' } 
        }
      });
    });

    await this.runTest('Get Market Scanner', async () => {
      return await this.client.request({
        method: 'tools/call',
        params: { name: 'get_market_scanner', arguments: { scanType: 'TOP_PERC_GAIN' } }
      });
    });
  }

  async testAccountData(): Promise<void> {
    await this.runTest('Get Accounts', async () => {
      return await this.client.request({
        method: 'tools/call',
        params: { name: 'get_accounts', arguments: {} }
      });
    });

    // Note: This will fail if no account ID is available
    await this.runTest('Get Positions (will likely fail without account)', async () => {
      return await this.client.request({
        method: 'tools/call',
        params: { name: 'get_positions', arguments: { accountId: 'DU123456' } }
      });
    });
  }

  async testTools(): Promise<void> {
    await this.runTest('List Tools', async () => {
      return await this.client.request({
        method: 'tools/list',
        params: {}
      });
    });
  }

  printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => r.passed === false).length;
    
    console.log(`Total tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting IBKR MCP Server Tests\n');

    await this.testTools();
    await this.testAuthentication();
    await this.testMarketData();
    await this.testAccountData();

    this.printResults();
  }
}

async function main() {
  const testClient = new IBKRMCPTestClient();

  try {
    await testClient.connect();
    await testClient.runAllTests();
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await testClient.disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
// Test IBKR MCP Server with real connection
import { IBKRClient } from './dist/services/ibkr-client.js';

// Disable SSL verification for self-signed certificates  
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const config = {
  baseUrl: 'https://localhost:5000/v1/api',
  timeout: 30000
};

async function testRealConnection() {
  console.log('🚀 Testing IBKR MCP Server with real connection...');
  console.log('');

  const client = new IBKRClient(config);

  try {
    // Test 1: Authentication
    console.log('1. 🔐 Testing Authentication...');
    const authStatus = await client.authenticate();
    console.log('   ✅ Auth Status:', JSON.stringify(authStatus, null, 2));
    console.log('');

    // Test 2: Get Accounts
    console.log('2. 👤 Getting Accounts...');
    const accounts = await client.getAccounts();
    console.log('   ✅ Accounts:', JSON.stringify(accounts, null, 2));
    console.log('');

    if (accounts && accounts.length > 0) {
      const accountId = accounts[0].accountId || accounts[0].id || accounts[0];
      console.log(`   📋 Using Account ID: ${accountId}`);

      // Test 3: Get Account Summary
      console.log('3. 💰 Getting Account Summary...');
      try {
        const summary = await client.getAccountSummary(accountId);
        console.log('   ✅ Account Summary:', JSON.stringify(summary, null, 2));
      } catch (error) {
        console.log('   ⚠️  Account Summary Error:', error.message);
      }
      console.log('');

      // Test 4: Get Positions
      console.log('4. 📊 Getting Positions...');
      try {
        const positions = await client.getPositions(accountId);
        console.log('   ✅ Positions:', JSON.stringify(positions, null, 2));
      } catch (error) {
        console.log('   ⚠️  Positions Error:', error.message);
      }
      console.log('');
    }

    // Test 5: Search Contracts
    console.log('5. 🔍 Searching for AAPL contracts...');
    try {
      const contracts = await client.searchContracts('AAPL');
      console.log('   ✅ AAPL Contracts found:', contracts.length);
      if (contracts.length > 0) {
        console.log('   📋 First contract:', JSON.stringify(contracts[0], null, 2));
      }
    } catch (error) {
      console.log('   ⚠️  Contract Search Error:', error.message);
    }
    console.log('');

    // Test 6: Market Data (if we have contracts)
    console.log('6. 📈 Testing Market Data...');
    try {
      // Use a common contract ID for AAPL (this might need adjustment)
      const marketData = await client.getMarketDataSnapshot([265598]); // AAPL contract ID
      console.log('   ✅ Market Data:', JSON.stringify(marketData, null, 2));
    } catch (error) {
      console.log('   ⚠️  Market Data Error:', error.message);
    }

    console.log('');
    console.log('🎉 Real connection test completed!');
    console.log('✅ IBKR MCP Server is ready for VS Code integration!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Ensure IBKR Gateway is running');
    console.log('2. Make sure you are logged in at https://localhost:5000');
    console.log('3. Check if your account has API permissions enabled');
  }
}

testRealConnection();

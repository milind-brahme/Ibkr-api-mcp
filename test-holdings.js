// Test script to get real IBKR holdings
import https from 'https';

// Disable SSL verification for self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('🔍 Testing IBKR Holdings Retrieval...');
console.log('Gateway URL: https://localhost:5000');
console.log('');

// Step 1: Verify authentication
async function checkAuth() {
    try {
        const response = await fetch('https://localhost:5000/v1/api/iserver/auth/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        console.log('🔐 Authentication Status:', data);
        
        if (data.authenticated) {
            console.log('✅ Successfully authenticated!');
            return true;
        } else {
            console.log('❌ Not authenticated. Please login at https://localhost:5000');
            return false;
        }
    } catch (error) {
        console.log('❌ Auth check failed:', error.message);
        return false;
    }
}

// Step 2: Get accounts
async function getAccounts() {
    try {
        const response = await fetch('https://localhost:5000/v1/api/iserver/accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        console.log('\n📋 Available Accounts:');
        console.log(JSON.stringify(data, null, 2));
        
        // Extract account IDs
        let accountIds = [];
        if (data.accounts) {
            accountIds = data.accounts.map(acc => acc.id || acc.accountId || acc);
        } else if (Array.isArray(data)) {
            accountIds = data.map(acc => acc.id || acc.accountId || acc);
        } else if (data.selectedAccount) {
            accountIds = [data.selectedAccount.accountId];
        }
        
        console.log('📊 Account IDs found:', accountIds);
        return accountIds;
    } catch (error) {
        console.log('❌ Failed to get accounts:', error.message);
        return [];
    }
}

// Step 3: Get positions for each account
async function getPositions(accountId) {
    try {
        console.log(`\n💼 Getting positions for account: ${accountId}`);
        
        const response = await fetch(`https://localhost:5000/v1/api/portfolio/${accountId}/positions/0`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.status === 200 && data) {
            console.log(`✅ Positions for ${accountId}:`);
            
            if (Array.isArray(data) && data.length > 0) {
                data.forEach((position, index) => {
                    console.log(`\n📈 Position ${index + 1}:`);
                    console.log(`   Symbol: ${position.contractDesc || position.symbol || 'N/A'}`);
                    console.log(`   Quantity: ${position.position || position.size || 'N/A'}`);
                    console.log(`   Market Value: ${position.mktValue || position.marketValue || 'N/A'}`);
                    console.log(`   Average Cost: ${position.avgCost || position.averageCost || 'N/A'}`);
                    console.log(`   Unrealized PnL: ${position.unrealizedPnl || position.unrealizedPL || 'N/A'}`);
                });
            } else {
                console.log('   📭 No positions found or empty portfolio');
            }
            
            // Also show raw data for debugging
            console.log('\n🔍 Raw positions data:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(`⚠️  Response status: ${response.status}`);
            console.log('Response:', JSON.stringify(data, null, 2));
        }
        
        return data;
    } catch (error) {
        console.log(`❌ Failed to get positions for ${accountId}:`, error.message);
        return null;
    }
}

// Step 4: Get account summary
async function getAccountSummary(accountId) {
    try {
        console.log(`\n💰 Getting account summary for: ${accountId}`);
        
        const response = await fetch(`https://localhost:5000/v1/api/portfolio/${accountId}/summary`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.status === 200) {
            console.log(`✅ Account Summary for ${accountId}:`);
            
            // Try to extract key financial metrics
            if (data.totalcashvalue) console.log(`   💵 Total Cash: ${data.totalcashvalue.amount} ${data.totalcashvalue.currency}`);
            if (data.netliquidationvalue) console.log(`   💎 Net Liquidation Value: ${data.netliquidationvalue.amount} ${data.netliquidationvalue.currency}`);
            if (data.equity) console.log(`   📊 Equity: ${data.equity.amount} ${data.equity.currency}`);
            if (data.unrealizedpnl) console.log(`   📈 Unrealized PnL: ${data.unrealizedpnl.amount} ${data.unrealizedpnl.currency}`);
            
            console.log('\n🔍 Raw account summary:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(`⚠️  Summary response status: ${response.status}`);
            console.log('Response:', JSON.stringify(data, null, 2));
        }
        
        return data;
    } catch (error) {
        console.log(`❌ Failed to get account summary for ${accountId}:`, error.message);
        return null;
    }
}

// Main test function
async function testHoldings() {
    console.log('🚀 Starting IBKR Holdings Test...\n');
    
    // Step 1: Check authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        console.log('\n❌ Cannot proceed without authentication');
        return;
    }
    
    // Step 2: Get accounts
    const accountIds = await getAccounts();
    if (accountIds.length === 0) {
        console.log('\n❌ No accounts found');
        return;
    }
    
    // Step 3: Get data for each account
    for (const accountId of accountIds) {
        await getPositions(accountId);
        await getAccountSummary(accountId);
        console.log('\n' + '='.repeat(50));
    }
    
    console.log('\n🎉 Holdings test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. If you see your real data above, the connection is working perfectly!');
    console.log('2. Now you can test the MCP server with VS Code');
    console.log('3. Try: node dist/index.js to start the MCP server');
    console.log('4. Then test in VS Code with: @ibkr-trading get my account summary');
}

// Run the test
testHoldings().catch(console.error);

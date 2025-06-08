// MCP Client to test IBKR MCP Server directly
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

// Create MCP client to communicate with our IBKR server
async function testIBKRMCP() {
    console.log('🚀 Testing IBKR MCP Server directly...\n');
    
    try {
        // Create transport to connect to our running IBKR MCP server
        const transport = new StdioClientTransport({
            command: 'node',
            args: ['dist/index.js'],
            env: {
                ...process.env,
                IBKR_BASE_URL: 'https://localhost:5000',
                NODE_TLS_REJECT_UNAUTHORIZED: '0',
                LOG_LEVEL: 'INFO'
            }
        });

        // Create MCP client
        const client = new Client(
            {
                name: 'ibkr-test-client',
                version: '1.0.0'
            },
            {
                capabilities: {}
            }
        );

        // Connect to the server
        await client.connect(transport);
        console.log('✅ Connected to IBKR MCP Server');

        // List available tools
        const tools = await client.listTools();
        console.log('\n📋 Available Tools:');
        tools.tools.forEach(tool => {
            console.log(`   - ${tool.name}: ${tool.description}`);
        });        // Test 1: Authenticate first
        console.log('\n🔐 Authenticating...');
        try {
            const authResult = await client.callTool({
                name: 'authenticate',
                arguments: {}
            });
            console.log('✅ Authentication:', JSON.stringify(authResult.content, null, 2));

            // Test 2: Get accounts
            console.log('\n🏦 Getting accounts...');
            const accountsResult = await client.callTool({
                name: 'get_accounts',
                arguments: {}
            });            console.log('✅ Accounts:', JSON.stringify(accountsResult.content, null, 2));
            
            // Extract account ID for further calls
            let accountId = null;
            if (accountsResult.content?.[0]?.text) {
                try {
                    const accountData = JSON.parse(accountsResult.content[0].text);
                    if (Array.isArray(accountData) && accountData.length > 0) {
                        accountId = accountData[0];
                    } else if (accountData.accounts && accountData.accounts.length > 0) {
                        accountId = accountData.accounts[0];
                    }
                    console.log(`📊 Using Account ID: ${accountId}`);
                } catch (parseError) {
                    console.log('⚠️ Could not parse account data:', parseError.message);
                    console.log('Raw text:', accountsResult.content[0].text);
                }
            }if (accountId) {
                // Test 3: Get positions
                console.log('\n💼 Getting positions...');
                const positionsResult = await client.callTool({
                    name: 'get_positions',
                    arguments: { accountId }
                });
                console.log('✅ Positions:', JSON.stringify(positionsResult.content, null, 2));

                // Test 4: Get account summary
                console.log('\n💰 Getting account summary...');
                const summaryResult = await client.callTool({
                    name: 'get_account_summary',
                    arguments: { accountId }
                });
                console.log('✅ Account Summary:', JSON.stringify(summaryResult.content, null, 2));                // Parse and display positions nicely
                if (positionsResult.content?.[0]?.text) {
                    try {
                        const positions = JSON.parse(positionsResult.content[0].text);
                        if (Array.isArray(positions) && positions.length > 0) {
                            console.log('\n📈 YOUR CURRENT HOLDINGS:');
                            console.log('=' .repeat(60));
                            
                            // Sort by unrealized P&L to find top performers
                            const sortedPositions = positions
                                .filter(pos => pos.unrealizedPnl !== undefined)
                                .sort((a, b) => (b.unrealizedPnl || 0) - (a.unrealizedPnl || 0));

                            sortedPositions.forEach((position, index) => {
                                const pnlColor = position.unrealizedPnl >= 0 ? '🟢' : '🔴';
                                console.log(`${index + 1}. ${position.contractDesc || position.symbol}`);
                                console.log(`   Quantity: ${position.position}`);
                                console.log(`   Market Value: $${position.mktValue?.toFixed(2) || 'N/A'}`);
                                console.log(`   Avg Cost: $${position.avgCost?.toFixed(2) || 'N/A'}`);
                                console.log(`   ${pnlColor} Unrealized P&L: $${position.unrealizedPnl?.toFixed(2) || 'N/A'}`);
                                console.log('');
                            });

                            // Show top 3 performers
                            console.log('\n🏆 TOP 3 PERFORMERS:');
                            console.log('=' .repeat(40));
                            sortedPositions.slice(0, 3).forEach((position, index) => {
                                const percentGain = position.avgCost ? 
                                    ((position.mktPrice - position.avgCost) / position.avgCost * 100) : 0;
                                console.log(`${index + 1}. ${position.contractDesc || position.symbol}`);
                                console.log(`   🚀 Gain: $${position.unrealizedPnl?.toFixed(2)} (${percentGain.toFixed(1)}%)`);
                                console.log(`   💰 Value: $${position.mktValue?.toFixed(2)}`);
                                console.log('');
                            });
                        }
                    } catch (parseError) {
                        console.log('⚠️ Could not parse positions data:', parseError.message);
                        console.log('Raw text:', positionsResult.content[0].text);
                    }
                }
            }
        } catch (error) {
            console.log('❌ Error calling tools:', error.message);
        }

        // Close connection
        await client.close();
        console.log('✅ Disconnected from IBKR MCP Server');

    } catch (error) {
        console.error('❌ Failed to test IBKR MCP:', error.message);
    }
}

// Run the test
testIBKRMCP().catch(console.error);

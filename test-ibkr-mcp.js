// MCP Client to test IBKR MCP Server
import { spawn } from 'child_process';
import { readFileSync } from 'fs';

class IBKRMCPClient {
    constructor() {
        this.server = null;
        this.requestId = 1;
    }

    async start() {
        console.log('🚀 Starting IBKR MCP Server...');
        
        // Start the IBKR MCP server
        this.server = spawn('node', ['dist/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env: {
                ...process.env,
                IBKR_BASE_URL: 'https://localhost:5000',
                NODE_TLS_REJECT_UNAUTHORIZED: '0'
            }
        });

        this.server.stderr.on('data', (data) => {
            console.error('Server error:', data.toString());
        });

        // Wait a moment for server to start
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ IBKR MCP Server started');
        return this;
    }

    async sendRequest(method, params = {}) {
        return new Promise((resolve, reject) => {
            const request = {
                jsonrpc: '2.0',
                id: this.requestId++,
                method,
                params
            };

            let response = '';
            
            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, 10000);

            const onData = (data) => {
                response += data.toString();
                
                // Try to parse complete JSON response
                try {
                    const lines = response.split('\n').filter(line => line.trim());
                    for (const line of lines) {
                        const parsed = JSON.parse(line);
                        if (parsed.id === request.id) {
                            clearTimeout(timeout);
                            this.server.stdout.off('data', onData);
                            resolve(parsed);
                            return;
                        }
                    }
                } catch (e) {
                    // Continue reading if JSON is incomplete
                }
            };

            this.server.stdout.on('data', onData);
            this.server.stdin.write(JSON.stringify(request) + '\n');
        });
    }

    async initialize() {
        console.log('🔧 Initializing MCP connection...');
        
        const initResponse = await this.sendRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {
                tools: {}
            },
            clientInfo: {
                name: 'IBKR-Test-Client',
                version: '1.0.0'
            }
        });

        console.log('✅ Initialized:', initResponse);

        // Send initialized notification
        await this.sendRequest('notifications/initialized');
        
        return initResponse;
    }

    async listTools() {
        console.log('📋 Listing available tools...');
        
        const response = await this.sendRequest('tools/list');
        console.log('Available tools:', response.result?.tools?.map(t => t.name) || []);
        
        return response;
    }

    async authenticate() {
        console.log('🔐 Testing authentication...');
        
        const response = await this.sendRequest('tools/call', {
            name: 'authenticate',
            arguments: {}
        });

        console.log('Authentication result:', response.result);
        return response;
    }

    async getAccountSummary() {
        console.log('💰 Getting account summary...');
        
        // First get accounts
        const accountsResponse = await this.sendRequest('tools/call', {
            name: 'get_accounts',
            arguments: {}
        });

        console.log('Accounts:', accountsResponse.result);

        if (accountsResponse.result?.content?.[0]?.text) {
            const accountsData = JSON.parse(accountsResponse.result.content[0].text);
            const accountId = accountsData.accounts?.[0] || accountsData.selectedAccount;

            if (accountId) {
                console.log(`📊 Getting summary for account: ${accountId}`);
                
                const summaryResponse = await this.sendRequest('tools/call', {
                    name: 'get_account_summary',
                    arguments: { accountId }
                });

                console.log('Account Summary:', summaryResponse.result);
                return summaryResponse;
            }
        }

        return accountsResponse;
    }

    async getPositions() {
        console.log('📈 Getting positions...');
        
        // First get accounts
        const accountsResponse = await this.sendRequest('tools/call', {
            name: 'get_accounts',
            arguments: {}
        });

        if (accountsResponse.result?.content?.[0]?.text) {
            const accountsData = JSON.parse(accountsResponse.result.content[0].text);
            const accountId = accountsData.accounts?.[0] || accountsData.selectedAccount;

            if (accountId) {
                console.log(`📊 Getting positions for account: ${accountId}`);
                
                const positionsResponse = await this.sendRequest('tools/call', {
                    name: 'get_positions',
                    arguments: { accountId }
                });

                console.log('Positions:', positionsResponse.result);
                
                // Parse and analyze positions
                if (positionsResponse.result?.content?.[0]?.text) {
                    const positions = JSON.parse(positionsResponse.result.content[0].text);
                    this.analyzePositions(positions);
                }
                
                return positionsResponse;
            }
        }

        return accountsResponse;
    }

    analyzePositions(positions) {
        if (!Array.isArray(positions) || positions.length === 0) {
            console.log('📭 No positions found');
            return;
        }

        console.log('\n🔍 PORTFOLIO ANALYSIS:');
        console.log('='.repeat(50));

        // Calculate total portfolio value
        const totalValue = positions.reduce((sum, pos) => sum + (pos.mktValue || 0), 0);
        console.log(`💼 Total Portfolio Value: $${totalValue.toLocaleString()}`);
        console.log(`📊 Total Positions: ${positions.length}`);

        // Sort by unrealized P&L (top performers)
        const sortedByPnL = [...positions].sort((a, b) => (b.unrealizedPnl || 0) - (a.unrealizedPnl || 0));
        
        console.log('\n🏆 TOP 3 PERFORMERS (by Unrealized P&L):');
        console.log('-'.repeat(50));
        
        sortedByPnL.slice(0, 3).forEach((pos, index) => {
            const pnlPercent = ((pos.unrealizedPnl || 0) / ((pos.avgCost || 0) * (pos.position || 1))) * 100;
            console.log(`${index + 1}. ${pos.contractDesc || pos.symbol}`);
            console.log(`   💰 Market Value: $${(pos.mktValue || 0).toLocaleString()}`);
            console.log(`   📈 Unrealized P&L: $${(pos.unrealizedPnl || 0).toLocaleString()} (${pnlPercent.toFixed(2)}%)`);
            console.log(`   📊 Quantity: ${pos.position || 0}`);
            console.log(`   💵 Avg Cost: $${(pos.avgCost || 0).toFixed(2)}`);
            console.log('');
        });

        // Sort by market value (largest holdings)
        const sortedByValue = [...positions].sort((a, b) => (b.mktValue || 0) - (a.mktValue || 0));
        
        console.log('💎 TOP 5 LARGEST HOLDINGS (by Market Value):');
        console.log('-'.repeat(50));
        
        sortedByValue.slice(0, 5).forEach((pos, index) => {
            const portfolioPercent = ((pos.mktValue || 0) / totalValue) * 100;
            console.log(`${index + 1}. ${pos.contractDesc || pos.symbol}`);
            console.log(`   💰 Market Value: $${(pos.mktValue || 0).toLocaleString()} (${portfolioPercent.toFixed(2)}% of portfolio)`);
            console.log(`   📊 Quantity: ${pos.position || 0}`);
            console.log(`   📈 Unrealized P&L: $${(pos.unrealizedPnl || 0).toLocaleString()}`);
            console.log('');
        });

        // Calculate total unrealized P&L
        const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + (pos.unrealizedPnl || 0), 0);
        console.log(`🎯 Total Unrealized P&L: $${totalUnrealizedPnL.toLocaleString()}`);
    }

    async close() {
        if (this.server) {
            this.server.kill();
            console.log('🛑 IBKR MCP Server stopped');
        }
    }
}

// Main test function
async function testIBKRMCP() {
    const client = new IBKRMCPClient();
    
    try {
        await client.start();
        await client.initialize();
        await client.listTools();
        await client.authenticate();
        await client.getAccountSummary();
        await client.getPositions();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await client.close();
    }
}

// Run the test
console.log('🧪 Testing IBKR MCP Server');
console.log('==========================');
testIBKRMCP();

// Simple test script to verify IBKR Gateway connection
import https from 'https';

// Disable SSL verification for self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('Testing IBKR Gateway connection...');
console.log('Gateway URL: https://localhost:5000');
console.log('');

// Test 1: Basic connectivity
async function testConnectivity() {
    try {
        const response = await fetch('https://localhost:5000/v1/api/iserver/auth/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.text();
        console.log('✅ Gateway is reachable');
        console.log('Response status:', response.status);
        console.log('Response:', data);
        
        if (response.status === 200) {
            console.log('🎉 Connection successful! Gateway is running.');
        } else {
            console.log('⚠️  Gateway is running but authentication may be required.');
        }
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('');
        console.log('Troubleshooting steps:');
        console.log('1. Ensure IBKR Gateway is running');
        console.log('2. Navigate to https://localhost:5000 in your browser');
        console.log('3. Accept the SSL certificate warning');
        console.log('4. Login with your IBKR credentials');
    }
}

// Test 2: Check available endpoints
async function testEndpoints() {
    const endpoints = [
        '/v1/api/iserver/auth/status',
        '/v1/api/iserver/accounts',
        '/v1/api/one/user'
    ];
    
    console.log('\nTesting API endpoints...');
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`https://localhost:5000${endpoint}`, {
                method: endpoint.includes('auth/status') ? 'POST' : 'GET'
            });
            console.log(`${endpoint}: ${response.status}`);
        } catch (error) {
            console.log(`${endpoint}: ERROR - ${error.message}`);
        }
    }
}

// Run tests
async function runTests() {
    await testConnectivity();
    await testEndpoints();
    
    console.log('\n📋 Next Steps:');
    console.log('1. If you see connection errors, ensure you\'ve accepted the SSL certificate in your browser');
    console.log('2. Login at https://localhost:5000 with your IBKR credentials');
    console.log('3. Once logged in, run this test again to see authenticated endpoints');
    console.log('4. Then test the MCP server with: node dist/index.js');
}

runTests().catch(console.error);

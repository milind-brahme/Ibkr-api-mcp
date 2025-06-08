# Testing Guide for IBKR MCP Server

This guide covers different approaches to testing the IBKR MCP Server, from unit tests to integration testing with a live IBKR connection.

## Test Types

### 1. Unit Tests
Test individual components in isolation using mocks.

**Location**: `src/__tests__/`
**Command**: `npm test`

```bash
# Run all unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 2. Integration Tests
Test the MCP server with mocked IBKR responses.

**Location**: `src/__tests__/integration/`
**Command**: `npm run test:integration`

### 3. Manual Testing
Test with a real IBKR connection using the test client.

**Location**: `examples/test-client.ts`
**Prerequisites**: Running IBKR Gateway

## Quick Start Testing

### Windows
```batch
# Run unit tests
scripts\run-tests.bat

# Manual testing (requires IBKR Gateway)
scripts\start-gateway.bat
# In another terminal:
node examples\test-client.js
```

### Linux/macOS
```bash
# Run unit tests
./scripts/run-tests.sh

# Manual testing (requires IBKR Gateway)
./scripts/start-gateway.sh
# In another terminal:
node examples/test-client.js
```

## Test Environment Setup

### 1. Install Test Dependencies
```bash
npm install --dev
```

### 2. Set Test Environment Variables
Create `.env.test`:
```env
NODE_ENV=test
IBKR_BASE_URL=https://localhost:5000
LOG_LEVEL=ERROR
```

### 3. Build the Project
```bash
npm run build
```

## Unit Testing

### Running Unit Tests
```bash
# All tests
npm test

# Specific test file
npm test -- ibkr-client.test.ts

# Tests matching pattern
npm test -- --testNamePattern="Authentication"

# Coverage report
npm test -- --coverage
```

### Test Structure
```
src/__tests__/
├── setup.ts                 # Jest setup
├── ibkr-client.test.ts      # IBKR client tests
├── tools/
│   ├── auth-tools.test.ts   # Authentication tools
│   ├── trading-tools.test.ts # Trading tools
│   └── market-data-tools.test.ts # Market data tools
└── integration/
    └── mcp-server.test.ts   # MCP server integration
```

### Key Test Cases

#### Authentication Tests
- ✅ Successful authentication
- ✅ Authentication failure handling
- ✅ Reauthentication
- ✅ Logout functionality
- ✅ Session status checking

#### Trading Tests
- ✅ Order placement (market, limit, stop)
- ✅ Order cancellation
- ✅ Position retrieval
- ✅ Account information
- ✅ Error handling for insufficient funds

#### Market Data Tests
- ✅ Contract search
- ✅ Real-time quotes
- ✅ Historical data
- ✅ Market scanners
- ✅ Error handling for invalid symbols

## Integration Testing

### With Test Client
The test client (`examples/test-client.ts`) provides comprehensive integration testing:

```typescript
// Connect to MCP server
const client = new IBKRMCPTestClient();
await client.connect();

// Run all tests
await client.runAllTests();

// Results summary
client.printResults();
```

### Test Categories
1. **Tool Listing**: Verify all MCP tools are available
2. **Authentication Flow**: Test complete auth cycle
3. **Market Data**: Test data retrieval
4. **Account Operations**: Test account-related functions

## Manual Testing with Live IBKR

### Prerequisites
1. **IBKR Account**: Active account with API permissions
2. **Client Portal Gateway**: Downloaded and configured
3. **Paper Trading**: Recommended for testing

### Setup Steps

#### 1. Configure IBKR Gateway
Create `conf.yaml` in gateway directory:
```yaml
listenPort: 5000
listenSsl: true
paperTrading: true  # Use paper trading for testing
```

#### 2. Start Gateway
```bash
# Windows
scripts\start-gateway.bat

# Linux/macOS
./scripts/start-gateway.sh
```

#### 3. Login via Browser
Navigate to `https://localhost:5000` and complete authentication.

#### 4. Run Tests
```bash
node examples/test-client.js
```

### Expected Test Results

#### Successful Tests ✅
- Authentication status check
- Tool listing
- Contract search for major symbols (AAPL, MSFT)
- Market data retrieval
- Historical data (if market is open)

#### Expected Failures ⚠️
- Order placement (requires specific account setup)
- Position retrieval (may be empty)
- Market data (outside market hours)

## Performance Testing

### Load Testing
Test with multiple concurrent requests:

```bash
# Install load testing tools
npm install -g artillery

# Run load test
artillery run artillery.yml
```

Example `artillery.yml`:
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Market data requests"
    requests:
      - get:
          url: "/market-data/AAPL"
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test IBKR MCP Server

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: npm run test:coverage
```

## Debugging Tests

### Debug Mode
```bash
# Run with debug output
DEBUG=* npm test

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand specific.test.ts
```

### Common Issues

#### 1. Authentication Timeouts
```bash
# Increase timeout in test
jest.setTimeout(30000);
```

#### 2. Network Connectivity
```bash
# Check IBKR Gateway status
curl -k https://localhost:5000/v1/api/iserver/auth/status
```

#### 3. SSL Certificate Issues
```bash
# Accept self-signed certificates
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Test Data

### Mock Data Examples
```typescript
// Mock market data
const mockMarketData = {
  conid: 265598,
  symbol: 'AAPL',
  bid: 150.25,
  ask: 150.30,
  last: 150.27,
  volume: 1000000
};

// Mock order response
const mockOrderResponse = {
  orderId: '12345',
  orderStatus: 'Submitted',
  encryptedOrderId: 'abc123'
};
```

### Test Accounts
For integration testing, use IBKR paper trading accounts:
- Account format: `DU123456` (demo accounts)
- Paper trading ensures no real money is at risk

## Coverage Reports

Generate detailed coverage reports:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Targets
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking
- Mock external dependencies (axios, IBKR API)
- Use dependency injection for better testability
- Reset mocks between tests

### 3. Error Testing
- Test both success and failure scenarios
- Verify error messages and types
- Test edge cases and boundary conditions

### 4. Async Testing
- Use `async/await` for async operations
- Set appropriate timeouts
- Handle promise rejections properly

## Troubleshooting

### Test Failures

#### "Connection refused"
- Ensure IBKR Gateway is running
- Check port configuration (default: 5000)
- Verify SSL certificate acceptance

#### "Authentication failed"
- Login via browser first
- Check API permissions in IBKR account
- Verify paper trading settings

#### "Module not found"
- Run `npm install`
- Check file paths and imports
- Verify TypeScript compilation

### Getting Help
- Check IBKR API documentation
- Review test logs and error messages
- Open GitHub issues for specific problems
- Join IBKR developer community forums
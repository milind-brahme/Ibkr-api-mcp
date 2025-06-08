# IBKR MCP Server

A Model Context Protocol (MCP) server for Interactive Brokers (IBKR) that provides trading and market data capabilities through a standardized interface.

## Features

### Authentication
- Session management with IBKR Client Portal API
- Automatic reauthentication
- Session status monitoring

### Trading Capabilities
- Place market, limit, stop, and stop-limit orders
- Cancel existing orders
- View active orders
- Get account positions
- Access account summaries and balances
- Multi-account support

### Market Data
- Real-time market data snapshots
- Historical price data with various timeframes
- Contract search and symbol lookup
- Market scanners (top gainers, losers, most active)
- Support for stocks, options, futures, and other instruments

## Prerequisites

1. **Interactive Brokers Account**: You need an active IBKR account
2. **Client Portal Gateway**: The IBKR Client Portal Gateway must be running locally
3. **API Permissions**: Ensure your account has API trading permissions enabled
4. **Node.js**: Version 18 or higher

## Installation

### Windows Quick Setup

```batch
# Clone the repository
git clone https://github.com/milind-brahme/Ibkr-api-mcp.git
cd Ibkr-api-mcp

# Run the Windows setup script
scripts\setup-dev-environment.bat
```

### Manual Installation (All Platforms)

```bash
# Clone the repository
git clone https://github.com/milind-brahme/Ibkr-api-mcp.git
cd Ibkr-api-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# IBKR Client Portal Gateway URL (default: https://localhost:5000)
IBKR_BASE_URL=https://localhost:5000

# Session timeout in milliseconds (default: 900000 = 15 minutes)
IBKR_SESSION_TIMEOUT=900000

# Log level (ERROR, WARN, INFO, DEBUG)
LOG_LEVEL=INFO

# Development mode
NODE_ENV=development
```

### IBKR Client Portal Gateway Setup

#### Windows
1. Download the Client Portal Gateway from IBKR
2. Extract to a folder (e.g., `C:\Users\YourName\clientportalapi`)
3. Set environment variable: `set IBKR_GATEWAY_DIR=C:\Users\YourName\clientportalapi`
4. Run: `scripts\start-gateway.bat`

#### Linux/macOS
1. Download the Client Portal Gateway from IBKR
2. Extract to a folder (e.g., `~/clientportalapi`)
3. Set environment variable: `export IBKR_GATEWAY_DIR=~/clientportalapi`
4. Run: `./scripts/start-gateway.sh`

The gateway typically runs on `https://localhost:5000`. You'll need to authenticate through the web interface first.

## Usage

### Running the Server

#### Windows
```batch
# Development mode
npm run dev

# Production mode
scripts\build-and-start.bat

# Or manually
npm run build
npm start
```

#### Linux/macOS
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Available Scripts

| Command | Windows | Linux/macOS | Description |
|---------|---------|-------------|-------------|
| Install dependencies | `scripts\install-dependencies.bat` | `npm install` | Install all dependencies |
| Setup dev environment | `scripts\setup-dev-environment.bat` | `npm run setup` | Complete setup |
| Start IBKR Gateway | `scripts\start-gateway.bat` | `./scripts/start-gateway.sh` | Start Client Portal Gateway |
| Build and start | `scripts\build-and-start.bat` | `npm run build && npm start` | Build and run server |

### Available Tools

#### Authentication Tools
- `authenticate` - Establish session with IBKR
- `reauthenticate` - Refresh current session
- `logout` - End current session
- `get_auth_status` - Check authentication status

#### Trading Tools
- `place_order` - Place trading orders
- `cancel_order` - Cancel existing orders
- `get_orders` - List active orders
- `get_positions` - Get account positions
- `get_accounts` - List available accounts
- `get_account_summary` - Get account balances and summary

#### Market Data Tools
- `search_contracts` - Search for tradeable contracts
- `get_market_data` - Get real-time quotes
- `get_historical_data` - Get historical price data
- `get_market_scanner` - Market screening tools

### Example Usage with MCP Client

```typescript
// Authenticate first
await client.callTool('authenticate', {});

// Get account information
const accounts = await client.callTool('get_accounts', {});

// Search for a stock
const contracts = await client.callTool('search_contracts', { 
  symbol: 'AAPL' 
});

// Get real-time market data
const marketData = await client.callTool('get_market_data', { 
  symbols: ['AAPL', 'MSFT', 'GOOGL'] 
});

// Place a market order
const order = await client.callTool('place_order', {
  accountId: 'DU123456',
  symbol: 'AAPL',
  orderType: 'MKT',
  side: 'BUY',
  quantity: 100
});

// Get historical data
const history = await client.callTool('get_historical_data', {
  symbol: 'AAPL',
  period: '1d',
  bar: '5min'
});
```

## API Reference

### Order Types
- `MKT` - Market order
- `LMT` - Limit order (requires `price`)
- `STP` - Stop order (requires `auxPrice`)
- `STOP_LIMIT` - Stop limit order (requires both `price` and `auxPrice`)

### Time in Force
- `DAY` - Day order (default)
- `GTC` - Good till canceled
- `IOC` - Immediate or cancel
- `FOK` - Fill or kill

### Historical Data Periods
- `1d`, `7d`, `1m`, `3m`, `6m`, `1y`, `2y`, `5y`

### Bar Sizes
- `1min`, `5min`, `15min`, `30min`, `1h`, `1d`, `1w`, `1m`

## Security Considerations

1. **HTTPS**: Always use HTTPS for production
2. **Authentication**: Keep sessions secure and monitor for unauthorized access
3. **API Limits**: Be aware of IBKR's rate limiting
4. **Error Handling**: Implement proper error handling for trading operations
5. **Logging**: Monitor all trading activities

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Client Portal Gateway is running
   - Check the correct port and URL
   - Verify SSL certificates

2. **Authentication Errors**
   - Log into Client Portal web interface first
   - Check if API permissions are enabled
   - Verify account credentials

3. **Order Placement Failures**
   - Ensure sufficient buying power
   - Check market hours for the instrument
   - Verify order parameters

4. **Market Data Issues**
   - Confirm market data subscriptions
   - Check if exchanges are open
   - Verify contract symbols

### Debug Mode

#### Windows
```batch
set DEBUG=*
npm run dev
```

#### Linux/macOS
```bash
DEBUG=* npm run dev
```

### Windows-Specific Issues

1. **PowerShell Execution Policy**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Node.js Path Issues**
   - Ensure Node.js is in your PATH
   - Restart command prompt after Node.js installation

3. **IBKR Gateway SSL Issues**
   - Accept the self-signed certificate in your browser
   - Navigate to `https://localhost:5000` and accept the warning

## Platform-Specific Notes

### Windows
- Use `scripts\*.bat` files for easy setup and management
- PowerShell scripts available for advanced users
- Supports Windows 10/11 and Windows Server

### Linux/macOS
- Use shell scripts in `scripts/` directory
- Requires bash shell
- Tested on Ubuntu, macOS, and other Unix-like systems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This software is for educational and development purposes. Always test thoroughly in a paper trading environment before using with real money. The authors are not responsible for any trading losses.

## Support

For issues related to:
- **MCP Server**: Open an issue in this repository
- **IBKR API**: Consult IBKR's official documentation
- **Trading Questions**: Contact Interactive Brokers support
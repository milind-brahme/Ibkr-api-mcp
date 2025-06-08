# VS Code MCP Integration Test

## Testing IBKR MCP Server in VS Code

### Prerequisites
1. ✅ IBKR MCP server built and configured
2. ✅ VS Code settings.json updated with server configuration
3. ⚠️ IBKR Gateway (installation completed, startup issues - can test without Gateway first)

### Test Commands in VS Code Chat

Once VS Code is restarted and the MCP server is recognized:

#### 1. Basic Connection Test
```
@ibkr-trading Can you check if the IBKR connection is working?
```

#### 2. Authentication Status
```
@ibkr-trading What is my authentication status with IBKR?
```

#### 3. Account Information
```
@ibkr-trading Can you get my account summary?
```

#### 4. Market Data Test
```
@ibkr-trading Get market data for AAPL stock
```

#### 5. Contract Search
```
@ibkr-trading Search for contracts with symbol TSLA
```

#### 6. Position Information
```
@ibkr-trading Show me my current positions
```

### Expected Behavior

#### Without IBKR Gateway Running:
- MCP server should start successfully
- Connection errors should be gracefully handled
- Error messages should be informative

#### With IBKR Gateway Running:
- Authentication commands should work
- Market data requests should return real data
- Account information should be accessible
- Trading tools should be functional

### Troubleshooting

#### If MCP Server Not Recognized:
1. Check VS Code settings.json syntax
2. Restart VS Code completely
3. Check if Node.js path is correct in settings
4. Verify dist/index.js exists and is executable

#### If Authentication Fails:
1. Ensure IBKR Gateway is running on https://localhost:5000
2. Login via web browser first
3. Check if API permissions are enabled in IBKR account
4. Verify environment variables in settings.json

#### If Market Data Fails:
1. Check market hours
2. Verify data subscriptions in IBKR account
3. Ensure contract symbols are valid
4. Check rate limiting

### Configuration Verification

Current VS Code MCP configuration:
```json
"ibkr-trading": {
    "type": "stdio", 
    "command": "node",
    "args": [
        "C:\\Users\\milin\\Ibkr-api-mcp\\dist\\index.js"
    ],
    "env": {
        "IBKR_BASE_URL": "https://localhost:5000",
        "IBKR_SESSION_TIMEOUT": "900000",
        "LOG_LEVEL": "INFO",
        "NODE_ENV": "production"
    }
}
```

### Next Steps - Testing VS Code Integration

#### Immediate Testing (Without Gateway):
1. **Restart VS Code completely** to load the new MCP server configuration
2. Open VS Code chat (Ctrl+Shift+I or View > Chat)
3. Try basic commands to verify MCP server is recognized:
   ```
   @ibkr-trading Can you check if the IBKR connection is working?
   ```
4. Test tool recognition:
   ```
   @ibkr-trading What tools do you have available?
   ```

#### Gateway Resolution:
The IBKR Gateway has configuration issues that need to be resolved:
- Configuration file loading errors persist
- May need to use the official IBKR Gateway installer instead of manual setup
- Consider downloading from IBKR's official portal

#### Expected Behavior During Testing:
- **MCP Server Recognition**: Should appear in VS Code chat as available
- **Without Gateway**: Tools should respond with connection errors gracefully
- **Tool Listing**: Should show all available IBKR trading tools
- **Error Handling**: Should provide clear error messages when Gateway unavailable

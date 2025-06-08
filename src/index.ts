#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { IBKRClient } from './services/ibkr-client.js';
import { IBKRConfig } from './types/ibkr.js';
import { tradingTools, handleTradingTool } from './tools/trading-tools.js';
import { marketDataTools, handleMarketDataTool } from './tools/market-data-tools.js';
import { authTools, handleAuthTool } from './tools/auth-tools.js';

// Default IBKR configuration
const DEFAULT_CONFIG: IBKRConfig = {
  baseUrl: process.env.IBKR_BASE_URL || 'https://localhost:5000',
  gateway: process.env.IBKR_GATEWAY || 'https://localhost:5000',
  sessionTimeout: parseInt(process.env.IBKR_SESSION_TIMEOUT || '900000'), // 15 minutes
};

class IBKRMCPServer {
  private server: Server;
  private ibkrClient: IBKRClient;

  constructor() {
    this.server = new Server(
      {
        name: 'ibkr-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.ibkrClient = new IBKRClient(DEFAULT_CONFIG);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          ...authTools,
          ...tradingTools,
          ...marketDataTools,
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;

        // Route to appropriate handler based on tool name
        if (authTools.some(tool => tool.name === name)) {
          result = await handleAuthTool(name, args, this.ibkrClient);
        } else if (tradingTools.some(tool => tool.name === name)) {
          result = await handleTradingTool(name, args, this.ibkrClient);
        } else if (marketDataTools.some(tool => tool.name === name)) {
          result = await handleMarketDataTool(name, args, this.ibkrClient);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Setup periodic reauthentication
    this.setupPeriodicReauth();
  }

  private setupPeriodicReauth(): void {
    // Reauthenticate every 10 minutes to maintain session
    setInterval(async () => {
      try {
        if (this.ibkrClient.getAuthenticationStatus()) {
          await this.ibkrClient.reauthenticate();
          console.error('Successfully reauthenticated with IBKR');
        }
      } catch (error) {
        console.error('Failed to reauthenticate:', error);
      }
    }, 600000); // 10 minutes
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('IBKR MCP Server running on stdio');
  }
}

// Start the server
const server = new IBKRMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
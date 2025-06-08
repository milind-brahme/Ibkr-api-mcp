import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { IBKRClient } from '../services/ibkr-client.js';

export const authTools: Tool[] = [
  {
    name: 'authenticate',
    description: 'Authenticate with IBKR and establish a session',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'reauthenticate',
    description: 'Reauthenticate the current session',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'logout',
    description: 'Logout and end the current session',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_auth_status',
    description: 'Check the current authentication status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export async function handleAuthTool(
  name: string,
  args: any,
  ibkrClient: IBKRClient
): Promise<any> {
  switch (name) {
    case 'authenticate': {
      return await ibkrClient.authenticate();
    }
    
    case 'reauthenticate': {
      return await ibkrClient.reauthenticate();
    }
    
    case 'logout': {
      return await ibkrClient.logout();
    }
    
    case 'get_auth_status': {
      return {
        authenticated: ibkrClient.getAuthenticationStatus(),
        timestamp: new Date().toISOString(),
      };
    }
    
    default:
      throw new Error(`Unknown auth tool: ${name}`);
  }
}
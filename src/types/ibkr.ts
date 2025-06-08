// IBKR API Types
export interface IBKRConfig {
  baseUrl: string;
  gateway: string;
  credentials?: {
    username?: string;
    password?: string;
  };
  sessionTimeout?: number;
}

export interface AuthResponse {
  authenticated: boolean;
  competing: boolean;
  connected: boolean;
  message: string;
  MAC?: string;
  serverInfo?: {
    serverName: string;
    serverVersion: string;
  };
}

export interface MarketDataSnapshot {
  conid: number;
  exchange?: string;
  bid?: number;
  ask?: number;
  last?: number;
  lastSize?: number;
  bidSize?: number;
  askSize?: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  change?: number;
  changePercent?: number;
  timestamp?: number;
}

export interface Contract {
  conid: number;
  symbol: string;
  secType: string;
  exchange: string;
  currency: string;
  localSymbol?: string;
  tradingClass?: string;
  description?: string;
}

export interface Position {
  accountId: string;
  conid: number;
  contractDesc: string;
  position: number;
  mktPrice: number;
  mktValue: number;
  currency: string;
  avgCost?: number;
  avgPrice?: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
}

export interface Account {
  id: string;
  accountVan: string;
  accountTitle: string;
  accountAlias?: string;
  model: string;
  tag: string;
  faclient: boolean;
  parent?: {
    mmc: string[];
    accountId: string;
    isMParent: boolean;
    isMChild: boolean;
    isMultiplex: boolean;
  };
  covestor: boolean;
  desc: string;
}

export interface OrderRequest {
  conid: number;
  orderType: 'MKT' | 'LMT' | 'STP' | 'STOP_LIMIT';
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  auxPrice?: number;
  tif?: 'GTC' | 'DAY' | 'IOC' | 'FOK';
  parentId?: string;
  outsideRth?: boolean;
  useAdaptive?: boolean;
}

export interface OrderResponse {
  orderId: string;
  orderStatus: string;
  encryptedOrderId?: string;
  warning_message?: string;
}

export interface HistoricalData {
  symbol: string;
  data: {
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v: number; // volume
    t: number; // timestamp
  }[];
  text?: string;
  moreAvailable?: boolean;
}

export interface AccountSummary {
  accountcode: {
    [accountId: string]: {
      amount: {
        [currency: string]: number;
      };
      currency: string;
      isNull: boolean;
      timestamp: number;
      value: string;
      severity: number;
    };
  };
}

export interface ScannerResult {
  rank: number;
  conid: number;
  contractDesc: string;
  symbol: string;
  secType: string;
  exchange: string;
  currency: string;
  marketCap?: number;
  price?: number;
  priceChange?: number;
  volume?: number;
}
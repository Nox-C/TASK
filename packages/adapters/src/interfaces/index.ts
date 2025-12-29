import { Order, Position, Balance } from '@task/shared';

export interface PriceTick {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  ts: Date;
  source?: string;
}

export interface MarketDataAdapter {
  subscribePrice(symbol: string, cb: (price: number) => void): void;
  getCandles(symbol: string, timeframe: string): Promise<PriceTick[]>;
}

export interface ExecutionAdapter {
  placeOrder(order: Omit<Order, 'id' | 'status'>): Promise<Order>;
  cancelOrder(orderId: string): Promise<void>;
}

export interface PortfolioAdapter {
  getBalances(accountId: string): Promise<Balance[]>;
  getPositions(accountId: string): Promise<Position[]>;
}

export interface WalletAdapter {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  signMessage(message: string): Promise<string>;
  sendTransaction(tx: any): Promise<string>;
  getAddress(): Promise<string>;
  getChainId(): Promise<number>;
}

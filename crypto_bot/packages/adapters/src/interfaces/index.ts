export interface MarketDataAdapter {
  subscribePrice(symbol: string, cb: (price:number)=>void): void;
  getCandles(symbol: string, timeframe: string): Promise<any>;
}

export interface ExecutionAdapter {
  placeOrder(order: any): Promise<any>;
  cancelOrder(orderId: string): Promise<any>;
}

export interface PortfolioAdapter {
  getBalances(): Promise<any>;
  getPositions(): Promise<any>;
}

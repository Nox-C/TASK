export interface GridLevel {
  price: number;
  type: 'BUY' | 'SELL';
  status: 'PENDING' | 'FILLED';
}

export interface GridBot {
  id: string;
  name: string;
  symbol: string;
  strategy: string;
  upperPrice: number;
  lowerPrice: number;
  gridCount: number;
  levels: GridLevel[]; // The actual lines to draw on the chart
  isActive: boolean;
  status: 'RUNNING' | 'STOPPED' | 'CREATING';
  totalPnl: number;
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
  exchange: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

export interface BacktestResult {
  id: string;
  botId: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
}

export interface PerformanceMetrics {
  totalEquity: number;
  totalPnl: number;
  winRate: number;
  totalBots: number;
  activeBots: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
}

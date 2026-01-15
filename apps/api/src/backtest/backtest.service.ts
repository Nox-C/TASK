import { Injectable } from '@nestjs/common';
import { MarketService } from '../market/market.service';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { runReplayCore } from './core';

export type Rule = {
  symbol: string;
  type: 'buy_below' | 'sell_above';
  threshold: string; // decimal string
  accountId?: string; // optional when running virtual
  qty: number;
};

export interface BacktestConfig {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  strategy?: string;
  parameters?: Record<string, any>;
  commission: number;
  slippage: number;
}

export interface BacktestResult {
  summary: {
    totalReturn: number;
    totalReturnPercent: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    avgTradeDuration: number;
  };
  trades: BacktestTrade[];
  equity: EquityPoint[];
  performance: PerformanceMetrics[];
  risk: RiskMetrics;
}

export interface BacktestTrade {
  id: string;
  symbol: string;
  type: "buy" | "sell" | "close_long" | "close_short";
  quantity: number;
  price: number;
  timestamp: string;
  pnl?: number;
  commission?: number;
}

export interface EquityPoint {
  timestamp: string;
  balance: number;
  equity: number;
  drawdown: number;
}

export interface PerformanceMetrics {
  timestamp: string;
  returns: number;
  volatility: number;
  sharpe: number;
}

export interface RiskMetrics {
  var95: number;
  var99: number;
  beta: number;
  alpha: number;
}

@Injectable()
export class BacktestService {
  constructor(
    private readonly market: MarketService,
    private readonly orders: OrdersService,
    private readonly prisma: PrismaService
  ) {}

  async runReplay(
    symbol: string,
    opts: { fromTs?: string; toTs?: string; delayMs?: number },
    rules: Rule[] = [],
    opts2: {
      persist?: boolean;
      startBalances?: any[];
      startPositions?: any[];
    } = {}
  ) {
    return runReplayCore(
      this.market,
      this.orders,
      this.prisma,
      symbol,
      opts,
      rules,
      opts2
    );
  }

  // Advanced Backtest Methods
  async runAdvancedBacktest(config: BacktestConfig): Promise<BacktestResult> {
    try {
      // Fetch historical data
      const historicalData = await this.fetchHistoricalData(
        config.symbol,
        config.timeframe,
        config.startDate,
        config.endDate
      );

      // Initialize backtest state
      let balance = config.initialBalance;
      let position = 0;
      const trades: BacktestTrade[] = [];
      const equity: EquityPoint[] = [];

      // Simulate trading
      for (let i = 0; i < historicalData.length; i++) {
        const candle = historicalData[i];
        const timestamp = candle.timestamp;

        // Execute strategy logic
        const signals = await this.executeStrategy(candle, config);

        // Process signals
        for (const signal of signals) {
          const trade = await this.executeSignal(signal, candle, config);
          if (trade) {
            trades.push(trade);
            balance += trade.pnl || 0;
          }
        }

        // Calculate equity
        const currentEquity = balance + position * candle.close;
        equity.push({
          timestamp,
          balance,
          equity: currentEquity,
          drawdown: this.calculateDrawdown(equity, i, config.initialBalance),
        });
      }

      // Calculate summary metrics
      const summary = this.calculateSummary(
        trades,
        balance,
        config.initialBalance
      );
      const performance = this.calculatePerformance(equity);
      const risk = this.calculateRisk(trades, equity);

      return {
        summary,
        trades,
        equity,
        performance,
        risk,
      };
    } catch (error) {
      throw new Error(
        `Advanced backtest failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async fetchHistoricalData(
    symbol: string,
    timeframe: string,
    startDate: string,
    endDate: string
  ) {
    // Placeholder - would fetch real market data
    return [
      {
        timestamp: "2024-01-01",
        open: 42000,
        high: 43000,
        low: 41000,
        close: 42500,
        volume: 1000,
      },
      {
        timestamp: "2024-01-02",
        open: 42500,
        high: 43500,
        low: 42000,
        close: 43000,
        volume: 1200,
      },
      // More data points...
    ];
  }

  private async executeStrategy(candle: any, config: BacktestConfig) {
    const signals = [];

    // Simple moving average crossover strategy as example
    if (config.strategy === "sma_crossover") {
      const shortMA = this.calculateSMA([candle.close], 10);
      const longMA = this.calculateSMA([candle.close], 20);

      if (shortMA > longMA) {
        signals.push({ type: "buy", quantity: 0.1 });
      } else if (shortMA < longMA) {
        signals.push({ type: "sell", quantity: 0.1 });
      }
    }

    return signals;
  }

  private async executeSignal(
    signal: any,
    candle: any,
    config: BacktestConfig
  ): Promise<BacktestTrade | null> {
    const price = signal.type === "buy" ? candle.high : candle.low;
    const commission = price * signal.quantity * (config.commission / 100);
    const slippage = price * (config.slippage / 100);

    return {
      id: `trade-${Date.now()}`,
      symbol: config.symbol,
      type: signal.type,
      quantity: signal.quantity,
      price: price + slippage,
      timestamp: candle.timestamp,
      commission,
    };
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateDrawdown(
    equity: EquityPoint[],
    currentIndex: number,
    initialBalance: number
  ): number {
    if (currentIndex === 0) return 0;
    const peak = Math.max(
      ...equity.slice(0, currentIndex + 1).map((e) => e.equity)
    );
    return ((peak - equity[currentIndex].equity) / peak) * 100;
  }

  private calculateSummary(
    trades: BacktestTrade[],
    finalBalance: number,
    initialBalance: number
  ) {
    const winningTrades = trades.filter((t) => t.pnl && t.pnl > 0);
    const losingTrades = trades.filter((t) => t.pnl && t.pnl < 0);

    return {
      totalReturn: finalBalance - initialBalance,
      totalReturnPercent:
        ((finalBalance - initialBalance) / initialBalance) * 100,
      annualizedReturn: 0, // Would calculate based on time period
      sharpeRatio: 0, // Would calculate risk-adjusted return
      maxDrawdown: 0, // Would calculate from equity curve
      winRate:
        trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      profitFactor: this.calculateProfitFactor(winningTrades, losingTrades),
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgWin: this.calculateAverage(winningTrades.map((t) => t.pnl || 0)),
      avgLoss: this.calculateAverage(losingTrades.map((t) => t.pnl || 0)),
      largestWin: Math.max(...winningTrades.map((t) => t.pnl || 0), 0),
      largestLoss: Math.min(...losingTrades.map((t) => t.pnl || 0), 0),
      avgTradeDuration: 0, // Would calculate average trade duration
    };
  }

  private calculatePerformance(equity: EquityPoint[]): PerformanceMetrics[] {
    return equity.map((point, index) => ({
      timestamp: point.timestamp,
      returns:
        index > 0
          ? ((point.equity - equity[index - 1].equity) /
              equity[index - 1].equity) *
            100
          : 0,
      volatility: 0, // Would calculate rolling volatility
      sharpe: 0, // Would calculate rolling Sharpe ratio
    }));
  }

  private calculateRisk(
    trades: BacktestTrade[],
    equity: EquityPoint[]
  ): RiskMetrics {
    const returns = equity.map((point, index) =>
      index > 0
        ? (point.equity - equity[index - 1].equity) / equity[index - 1].equity
        : 0
    );

    return {
      var95: this.calculateVaR(returns, 0.05),
      var99: this.calculateVaR(returns, 0.01),
      beta: 1.0, // Would calculate against benchmark
      alpha: 0, // Would calculate alpha
    };
  }

  private calculateProfitFactor(
    winningTrades: BacktestTrade[],
    losingTrades: BacktestTrade[]
  ): number {
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLosses = Math.abs(
      losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    );
    return totalLosses === 0 ? totalWins : totalWins / totalLosses;
  }

  private calculateAverage(values: number[]): number {
    return values.length === 0
      ? 0
      : values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor(returns.length * confidence);
    return sortedReturns[index] || 0;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketService } from '../market/market.service';
import { PrismaService } from '../prisma/prisma.service';

export interface StrategyRule {
  id: string;
  name: string;
  type: 'technical' | 'price_action' | 'volume' | 'time_based';
  conditions: StrategyCondition[];
  actions: StrategyAction[];
  enabled: boolean;
}

export interface StrategyCondition {
  indicator: string;
  operator: 'greater_than' | 'less_than' | 'crosses_above' | 'crosses_below' | 'between' | 'outside';
  value: number | number[];
  timeframe: string;
}

export interface StrategyAction {
  type: 'buy' | 'sell' | 'close_long' | 'close_short' | 'adjust_stop_loss' | 'adjust_take_profit';
  parameters: Record<string, any>;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'trend' | 'momentum' | 'mean_reversion' | 'breakout' | 'scalping';
  riskLevel: 'low' | 'medium' | 'high';
  rules: StrategyRule[];
  defaultParameters: Record<string, any>;
}

@Injectable()
export class StrategyService {
  constructor(private readonly prisma: PrismaService, private readonly market: MarketService) {}

  private templates: StrategyTemplate[] = [
    {
      id: 'golden-cross',
      name: '🌟 Golden Cross Strategy',
      description: 'Buy when 50 SMA crosses above 200 SMA, sell on death cross',
      category: 'trend',
      riskLevel: 'medium',
      rules: [
        {
          id: 'golden-cross-entry',
          name: 'Golden Cross Entry',
          type: 'technical',
          conditions: [
            {
              indicator: 'sma_50_cross_sma_200',
              operator: 'crosses_above',
              value: 0,
              timeframe: '1h'
            }
          ],
          actions: [
            {
              type: 'buy',
              parameters: {
                positionSize: 0.1,
                stopLoss: 2,
                takeProfit: 5
              }
            }
          ],
          enabled: true
        },
        {
          id: 'death-cross-exit',
          name: 'Death Cross Exit',
          type: 'technical',
          conditions: [
            {
              indicator: 'sma_50_cross_sma_200',
              operator: 'crosses_below',
              value: 0,
              timeframe: '1h'
            }
          ],
          actions: [
            {
              type: 'close_long',
              parameters: {}
            }
          ],
          enabled: true
        }
      ],
      defaultParameters: {
        smaFast: 50,
        smaSlow: 200,
        positionSize: 0.1,
        stopLoss: 2,
        takeProfit: 5
      }
    },
    {
      id: 'rsi-oversold',
      name: '📉 RSI Oversold Strategy',
      description: 'Buy when RSI is oversold, sell when overbought',
      category: 'mean_reversion',
      riskLevel: 'low',
      rules: [
        {
          id: 'rsi-oversold-entry',
          name: 'RSI Oversold Entry',
          type: 'technical',
          conditions: [
            {
              indicator: 'rsi',
              operator: 'less_than',
              value: 30,
              timeframe: '15m'
            }
          ],
          actions: [
            {
              type: 'buy',
              parameters: {
                positionSize: 0.05,
                stopLoss: 1.5,
                takeProfit: 3
              }
            }
          ],
          enabled: true
        },
        {
          id: 'rsi-overbought-exit',
          name: 'RSI Overbought Exit',
          type: 'technical',
          conditions: [
            {
              indicator: 'rsi',
              operator: 'greater_than',
              value: 70,
              timeframe: '15m'
            }
          ],
          actions: [
            {
              type: 'close_long',
              parameters: {}
            }
          ],
          enabled: true
        }
      ],
      defaultParameters: {
        rsiPeriod: 14,
        rsiOversold: 30,
        rsiOverbought: 70,
        positionSize: 0.05,
        stopLoss: 1.5,
        takeProfit: 3
      }
    },
    {
      id: 'macd-momentum',
      name: '📊 MACD Momentum Strategy',
      description: 'Trade based on MACD line crossovers and histogram',
      category: 'momentum',
      riskLevel: 'medium',
      rules: [
        {
          id: 'macd-bullish-cross',
          name: 'MACD Bullish Cross',
          type: 'technical',
          conditions: [
            {
              indicator: 'macd_line_cross_signal',
              operator: 'crosses_above',
              value: 0,
              timeframe: '1h'
            }
          ],
          actions: [
            {
              type: 'buy',
              parameters: {
                positionSize: 0.08,
                stopLoss: 2.5,
                takeProfit: 6
              }
            }
          ],
          enabled: true
        },
        {
          id: 'macd-bearish-cross',
          name: 'MACD Bearish Cross',
          type: 'technical',
          conditions: [
            {
              indicator: 'macd_line_cross_signal',
              operator: 'crosses_below',
              value: 0,
              timeframe: '1h'
            }
          ],
          actions: [
            {
              type: 'close_long',
              parameters: {}
            }
          ],
          enabled: true
        }
      ],
      defaultParameters: {
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
        positionSize: 0.08,
        stopLoss: 2.5,
        takeProfit: 6
      }
    },
    {
      id: 'bollinger-breakout',
      name: '🎯 Bollinger Band Breakout',
      description: 'Buy on upper band breakout, sell on lower band breakdown',
      category: 'breakout',
      riskLevel: 'high',
      rules: [
        {
          id: 'bb-upper-breakout',
          name: 'BB Upper Band Breakout',
          type: 'technical',
          conditions: [
            {
              indicator: 'price_cross_bb_upper',
              operator: 'crosses_above',
              value: 0,
              timeframe: '30m'
            }
          ],
          actions: [
            {
              type: 'buy',
              parameters: {
                positionSize: 0.06,
                stopLoss: 3,
                takeProfit: 8
              }
            }
          ],
          enabled: true
        },
        {
          id: 'bb-lower-breakdown',
          name: 'BB Lower Band Breakdown',
          type: 'technical',
          conditions: [
            {
              indicator: 'price_cross_bb_lower',
              operator: 'crosses_below',
              value: 0,
              timeframe: '30m'
            }
          ],
          actions: [
            {
              type: 'close_long',
              parameters: {}
            }
          ],
          enabled: true
        }
      ],
      defaultParameters: {
        bbPeriod: 20,
        bbStdDev: 2,
        positionSize: 0.06,
        stopLoss: 3,
        takeProfit: 8
      }
    },
    {
      id: 'volume-surge',
      name: '📈 Volume Surge Strategy',
      description: 'Trade on unusual volume spikes with price confirmation',
      category: 'momentum',
      riskLevel: 'medium',
      rules: [
        {
          id: 'volume-surge-entry',
          name: 'Volume Surge Entry',
          type: 'volume',
          conditions: [
            {
              indicator: 'volume_ratio',
              operator: 'greater_than',
              value: 3,
              timeframe: '5m'
            },
            {
              indicator: 'price_change_5m',
              operator: 'greater_than',
              value: 1,
              timeframe: '5m'
            }
          ],
          actions: [
            {
              type: 'buy',
              parameters: {
                positionSize: 0.04,
                stopLoss: 1.8,
                takeProfit: 4
              }
            }
          ],
          enabled: true
        },
        {
          id: 'volume-surge-exit',
          name: 'Volume Surge Exit',
          type: 'volume',
          conditions: [
            {
              indicator: 'volume_ratio',
              operator: 'less_than',
              value: 1.5,
              timeframe: '5m'
            }
          ],
          actions: [
            {
              type: 'close_long',
              parameters: {}
            }
          ],
          enabled: true
        }
      ],
      defaultParameters: {
        volumeThreshold: 3,
        priceChangeThreshold: 1,
        positionSize: 0.04,
        stopLoss: 1.8,
        takeProfit: 4
      }
    }
  ];

  async getTemplates(): Promise<StrategyTemplate[]> {
    return this.templates;
  }

  async getTemplate(id: string): Promise<StrategyTemplate | null> {
    return this.templates.find(template => template.id === id) || null;
  }

  async createCustomStrategy(strategyData: Partial<StrategyTemplate>): Promise<StrategyTemplate> {
    const customStrategy: StrategyTemplate = {
      id: `custom-${Date.now()}`,
      name: strategyData.name || 'Custom Strategy',
      description: strategyData.description || 'User-defined custom strategy',
      category: strategyData.category || 'trend',
      riskLevel: strategyData.riskLevel || 'medium',
      rules: strategyData.rules || [],
      defaultParameters: strategyData.defaultParameters || {}
    };

    // In a real implementation, save to database
    return customStrategy;
  }

  async validateStrategy(strategy: StrategyTemplate): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!strategy.name || strategy.name.trim().length === 0) {
      errors.push('Strategy name is required');
    }

    if (strategy.rules.length === 0) {
      errors.push('At least one rule is required');
    }

    strategy.rules.forEach((rule, index) => {
      if (!rule.conditions || rule.conditions.length === 0) {
        errors.push(`Rule ${index + 1}: At least one condition is required`);
      }

      if (!rule.actions || rule.actions.length === 0) {
        errors.push(`Rule ${index + 1}: At least one action is required`);
      }

      rule.conditions.forEach((condition, condIndex) => {
        if (!condition.indicator) {
          errors.push(`Rule ${index + 1}, Condition ${condIndex + 1}: Indicator is required`);
        }
        if (!condition.operator) {
          errors.push(`Rule ${index + 1}, Condition ${condIndex + 1}: Operator is required`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async calculateTechnicalIndicators(symbol: string, timeframe: string, limit: number = 100) {
    // Get OHLCV data
    const ohlcvData = await this.market.getOHLCV(symbol, timeframe, limit);
    
    if (ohlcvData.length === 0) {
      throw new Error('No data available for indicator calculation');
    }

    const indicators = {
      sma: this.calculateSMA(ohlcvData, 20),
      ema: this.calculateEMA(ohlcvData, 20),
      rsi: this.calculateRSI(ohlcvData, 14),
      macd: this.calculateMACD(ohlcvData, 12, 26, 9),
      bollinger: this.calculateBollingerBands(ohlcvData, 20, 2),
      volume: this.calculateVolumeRatio(ohlcvData, 20)
    };

    return indicators;
  }

  private calculateSMA(data: any[], period: number) {
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.close, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  private calculateEMA(data: any[], period: number) {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA
    const initialSMA = data.slice(0, period).reduce((acc, candle) => acc + candle.close, 0) / period;
    ema.push(initialSMA);

    for (let i = period; i < data.length; i++) {
      const currentEMA = (data[i].close - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(currentEMA);
    }

    return ema;
  }

  private calculateRSI(data: any[], period: number) {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    // Calculate initial gains and losses
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }

    for (let i = period; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      const avgGain = gains / period;
      const avgLoss = losses / period;

      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }

      // Update gains and losses
      if (change > 0) {
        gains = (avgGain * (period - 1) + change) / period;
        losses = (avgLoss * (period - 1)) / period;
      } else {
        gains = (avgGain * (period - 1)) / period;
        losses = (avgLoss * (period - 1) - change) / period;
      }
    }

    return rsi;
  }

  private calculateMACD(data: any[], fast: number, slow: number, signal: number) {
    const emaFast = this.calculateEMA(data, fast);
    const emaSlow = this.calculateEMA(data, slow);
    
    const macdLine = emaFast.slice(slow - fast).map((fast, i) => fast - emaSlow[i]);
    const signalLine = this.calculateEMA(
      macdLine.map((val, i) => ({ close: val, time: i })),
      signal
    );
    
    const histogram = macdLine.slice(signalLine.length).map((macd, i) => macd - signalLine[i]);

    return {
      macd: macdLine,
      signal: signalLine,
      histogram
    };
  }

  private calculateBollingerBands(data: any[], period: number, stdDev: number) {
    const sma = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i - (period - 1)];
      const variance = slice.reduce((acc, candle) => {
        return acc + Math.pow(candle.close - mean, 2);
      }, 0) / period;
      const standardDeviation = Math.sqrt(variance);

      upper.push(mean + (standardDeviation * stdDev));
      lower.push(mean - (standardDeviation * stdDev));
    }

    return { upper, middle: sma, lower };
  }

  private calculateVolumeRatio(data: any[], period: number) {
    const volumeMA = this.calculateSMA(data.map(d => ({ close: d.volume, time: d.time })), period);
    return data.slice(period - 1).map((candle, i) => ({
      current: candle.volume,
      average: volumeMA[i],
      ratio: candle.volume / volumeMA[i]
    }));
  }

  // Simple Strategy CRUD Methods (consolidated from strategies/ directory)
  async createSimpleStrategy(name: string, description: string) {
    return this.prisma.strategy.create({ 
      data: { name, description } 
    });
  }

  async findAllStrategies() {
    return this.prisma.strategy.findMany();
  }

  async findStrategyById(id: string) {
    const strategy = await this.prisma.strategy.findUnique({ where: { id } });
    if (!strategy) throw new NotFoundException('Strategy not found');
    return strategy;
  }

  async updateStrategy(id: string, updateData: { name?: string; description?: string }) {
    await this.findStrategyById(id);
    return this.prisma.strategy.update({ 
      where: { id }, 
      data: updateData 
    });
  }

  async deleteStrategy(id: string) {
    await this.findStrategyById(id);
    return this.prisma.strategy.delete({ where: { id } });
  }
}

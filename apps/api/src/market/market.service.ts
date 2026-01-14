import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketEventsService } from './events.service';

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService, private readonly events: MarketEventsService) {}

  async ingestTick(payload: { symbol: string; price: string | number; bid?: string | number; ask?: string | number; source?: string; ts?: string | Date }) {
    const row = await this.prisma.priceTick.create({ data: { symbol: payload.symbol, price: payload.price as any, bid: payload.bid as any, ask: payload.ask as any, source: payload.source, ts: payload.ts ? new Date(payload.ts) : new Date() } });
    // emit event for subscribers
    this.events.emitTick({ symbol: row.symbol, price: row.price.toString(), ts: row.ts });
    return row;
  }

  async latestTick(symbol: string) {
    return this.prisma.priceTick.findFirst({ where: { symbol }, orderBy: { ts: 'desc' } as any });
  }

  async getOHLCV(symbol: string, timeframe: string = '1m', limit: number = 100) {
    // Map timeframe to milliseconds
    const timeframeMs = this.parseTimeframe(timeframe);
    const endTime = Date.now();
    const startTime = endTime - (limit * timeframeMs);

    // Try to get data from database first
    const ticks = await this.prisma.priceTick.findMany({
      where: {
        symbol,
        ts: {
          gte: new Date(startTime),
          lte: new Date(endTime)
        }
      },
      orderBy: { ts: 'asc' }
    });

    // If we have database ticks, aggregate them into OHLCV
    if (ticks.length > 0) {
      return this.aggregateToOHLCV(ticks, timeframeMs, limit);
    }

    // Fallback: Fetch from Binance
    try {
      const mapped = this.mapToBinance(symbol);
      const interval = this.mapTimeframeToBinance(timeframe);
      const candles = await this.fetchBinanceCandles(mapped, interval, startTime, endTime);
      
      return candles.slice(-limit).map(c => ({
        time: Math.floor(Number(c[0]) / 1000), // Convert to seconds
        open: Number(c[1]),
        high: Number(c[2]),
        low: Number(c[3]),
        close: Number(c[4]),
        volume: Number(c[5])
      }));
    } catch (err) {
      console.error('Failed to fetch OHLCV data:', err);
      return [];
    }
  }

  private parseTimeframe(timeframe: string): number {
    const unit = timeframe.slice(-1);
    const value = parseInt(timeframe.slice(0, -1)) || 1;
    
    switch (unit) {
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'w': return value * 7 * 24 * 60 * 60 * 1000;
      default: return 60 * 1000; // Default to 1 minute
    }
  }

  private mapTimeframeToBinance(timeframe: string): string {
    // Map our timeframe format to Binance interval format
    const map: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w'
    };
    return map[timeframe] || '1m';
  }

  private aggregateToOHLCV(ticks: any[], timeframeMs: number, limit: number) {
    if (ticks.length === 0) return [];

    const candles: any[] = [];
    const startTime = Math.floor(ticks[0].ts.getTime() / timeframeMs) * timeframeMs;

    for (let i = 0; i < limit; i++) {
      const candleStart = startTime + (i * timeframeMs);
      const candleEnd = candleStart + timeframeMs;

      const candleTicks = ticks.filter(t => {
        const time = t.ts.getTime();
        return time >= candleStart && time < candleEnd;
      });

      if (candleTicks.length > 0) {
        const prices = candleTicks.map(t => Number(t.price));
        candles.push({
          time: Math.floor(candleStart / 1000),
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
          volume: candleTicks.length
        });
      }
    }

    return candles;
  }

  async replayTicksFromDb(symbol: string, opts: { fromTs?: string; toTs?: string; delayMs?: number } = {}, cb?: (t:any)=>Promise<void>) {
    const where: any = { symbol };
    if (opts.fromTs) where.ts = { gte: new Date(opts.fromTs) };
    if (opts.toTs) where.ts = { ...where.ts, lt: new Date(opts.toTs) };
    const ticks = await this.prisma.priceTick.findMany({ where, orderBy: { ts: 'asc' } as any });
if (ticks.length > 0) {
      for (const t of ticks) {
        if (cb) await cb(t);
        if (opts.delayMs) await new Promise(r => setTimeout(r, opts.delayMs));
      }
      return ticks.length;
    }

    // Fallback: fetch real CEX candles (Binance) and synthesize replay ticks
    try {
      const from = opts.fromTs ? new Date(opts.fromTs) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = opts.toTs ? new Date(opts.toTs) : new Date();
      const interval = this.chooseInterval(from, to);
      const mapped = this.mapToBinance(symbol);
      const candles = await this.fetchBinanceCandles(mapped, interval, from.getTime(), to.getTime());
      let count = 0;
      for (const c of candles) {
        const tick = { symbol, price: Number(c[4]), ts: new Date(Number(c[6])) };
        if (cb) await cb(tick);
        count++;
        if (opts.delayMs) await new Promise(r => setTimeout(r, opts.delayMs));
      }
      return count;
    } catch (err) {
      // If fallback fails, return 0
      return 0;
    }
  }

  private mapToBinance(sym: string): string {
    // Map symbols like BTC-USD or BTC/USD to Binance format BTCUSDT
    const s = sym.replace('-', '').replace('/', '').toUpperCase();
    if (s.endsWith('USD')) return s.replace('USD', 'USDT');
    return s;
  }

  private chooseInterval(from: Date, to: Date): string {
    const diff = to.getTime() - from.getTime();
    const day = 24 * 60 * 60 * 1000;
    if (diff <= 2 * day) return '1m';
    if (diff <= 14 * day) return '5m';
    if (diff <= 120 * day) return '1h';
    return '1d';
  }

  private async fetchBinanceCandles(symbol: string, interval: string, startTime: number, endTime: number) {
    const out: any[] = [];
    let from = startTime;
    while (from < endTime) {
      const url = new URL('https://api.binance.com/api/v3/klines');
      url.searchParams.set('symbol', symbol);
      url.searchParams.set('interval', interval);
      url.searchParams.set('startTime', String(from));
      url.searchParams.set('endTime', String(endTime));
      url.searchParams.set('limit', '1000');
      const res = await fetch(url.toString());
      if (!res.ok) break;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      out.push(...data);
      // data[i]: [openTime, open, high, low, close, volume, closeTime, ...]
      const lastOpenTime = Number(data[data.length - 1][0]);
      from = lastOpenTime + 1;
      // Avoid hammering
      await new Promise(r => setTimeout(r, 200));
    }
    return out;
  }
}

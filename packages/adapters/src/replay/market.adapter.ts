import { MarketDataAdapter } from '../interfaces';

export interface Tick {
  ts: string; // ISO timestamp
  symbol: string;
  price: string; // decimal as string
  source?: string;
}

export class ReplayMarketAdapter implements MarketDataAdapter {
  private ticks: Tick[] = [];
  private subscribers: Array<(price:number, tick:Tick)=>void> = [];
  private index = 0;
  private intervalMs = 1000;
  private timer?: NodeJS.Timeout;

  loadTicks(ticks: Tick[]) {
    // assume ticks are sorted by ts
    this.ticks = ticks;
    this.index = 0;
  }

  setIntervalMs(ms: number) {
    this.intervalMs = ms;
  }

  subscribePrice(symbol: string, cb: (price:number)=>void) {
    this.subscribers.push((price, tick) => {
      if (tick.symbol === symbol) cb(price);
    });
  }

  async getCandles(symbol: string, timeframe: string) {
    // simple grouping by timeframe not implemented; return raw ticks for now
    return this.ticks.filter(t => t.symbol === symbol);
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.emitTick(), this.intervalMs);
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = undefined; }
  }

  private emitTick() {
    if (this.index >= this.ticks.length) { this.stop(); return; }
    const t = this.ticks[this.index++];
    const price = Number(t.price);
    for (const s of this.subscribers) s(price, t);
  }
}

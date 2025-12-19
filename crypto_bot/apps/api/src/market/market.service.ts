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

  async replayTicksFromDb(symbol: string, opts: { fromTs?: string; toTs?: string; delayMs?: number } = {}, cb?: (t:any)=>Promise<void>) {
    const where: any = { symbol };
    if (opts.fromTs) where.ts = { gte: new Date(opts.fromTs) };
    if (opts.toTs) where.ts = { ...where.ts, lt: new Date(opts.toTs) };
    const ticks = await this.prisma.priceTick.findMany({ where, orderBy: { ts: 'asc' } as any });
    for (const t of ticks) {
      if (cb) await cb(t);
      if (opts.delayMs) await new Promise(r => setTimeout(r, opts.delayMs));
    }
    return ticks.length;
  }
}


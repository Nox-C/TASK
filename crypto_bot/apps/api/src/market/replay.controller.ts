import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from './market.service';
import { WsGateway } from '../ws/ws.gateway';

@Controller('market/replay')
export class MarketReplayController {
  constructor(private readonly prisma: PrismaService, private readonly market: MarketService) {}

  @Post('/ingest')
  async ingestTicks(@Body() body: { ticks: Array<{ ts: string; symbol: string; price: string; source?: string }> }) {
    const inserted = [];
    for (const t of body.ticks) {
      const row = await this.prisma.priceTick.create({ data: { symbol: t.symbol, price: t.price, ts: new Date(t.ts), source: t.source || 'replay' } });
      inserted.push(row);
    }
    return { inserted: inserted.length };
  }

  @Post('/play')
  async play(@Body() body: { symbol: string; fromTs?: string; toTs?: string; delayMs?: number }) {
    const count = await this.market.replayTicksFromDb(body.symbol, { fromTs: body.fromTs, toTs: body.toTs, delayMs: body.delayMs || 10 }, async (t) => {
      if (WsGateway.instance && WsGateway.instance.server) {
        WsGateway.instance.server.emit('market.price', { symbol: t.symbol, price: t.price, ts: t.ts });
      }
    });
    return { played: count };
  }
}

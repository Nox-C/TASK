import PgBoss from 'pg-boss';
import { PrismaClient } from '../../../api/generated/prisma/client.js';

export function registerReplayProcessor(boss: PgBoss) {
  const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL || '',
  });
  boss.work('backtest.replay', async (job) => {
    const { fromTs, toTs, symbol } = job.data as any;
    const q: any = { where: { symbol } };
    if (fromTs) q.where.ts = { gte: new Date(fromTs) };
    if (toTs) q.where = { ...q.where, lt: new Date(toTs) };
    const ticks = await prisma.priceTick.findMany({ where: { symbol }, orderBy: { ts: 'asc' } as any });
    for (const t of ticks) {
      // insert into priceTick again to simulate stream or send to an HTTP endpoint
      // For now just log; future: emit via WebSocket or call MarketService
      console.log('[replay.processor] tick', t.symbol, t.price, t.ts);
      // short sleep to simulate real-time
      await new Promise(r => setTimeout(r, 10));
    }
  });
}

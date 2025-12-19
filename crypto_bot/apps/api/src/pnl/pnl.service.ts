import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Decimal from 'decimal.js';
import { RealizedService } from './realized.service';

@Injectable()
export class PnlService {
  constructor(private readonly prisma: PrismaService, private readonly realized: RealizedService) {}

  async computeSnapshotForAccount(accountId: string) {
    // fetch balances and positions
    const [balances, positions] = await Promise.all([
      this.prisma.balance.findMany({ where: { accountId } }),
      this.prisma.position.findMany({ where: { accountId } }),
    ]);

    // compute realized PnL using RealizedService (FIFO)
    const realizedBySymbol = await this.realized.computeRealizedForAccount(accountId);

    // gather latest ticks for each position
    const latestTicks: Record<string, any> = {};
    for (const p of positions) {
      const tick = await this.prisma.priceTick.findFirst({ where: { symbol: p.symbol }, orderBy: { ts: 'desc' } as any });
      if (tick) latestTicks[p.symbol] = tick;
    }

    const { computeSnapshotFromData } = await import('./helpers');
    const computed = computeSnapshotFromData(balances, positions, latestTicks, realizedBySymbol);

    const snapshot = await this.prisma.pnlSnapshot.create({
      data: {
        accountId,
        realizedPnl: computed.realizedPnl,
        unrealizedPnl: computed.unrealizedPnl,
        totalValue: computed.totalValue,
        details: { balances, positions, realizedBySymbol },
      },
    });

    return snapshot;
  }

  async computeSnapshotsAll() {
    const accounts = await this.prisma.account.findMany();
    const results = [];
    for (const a of accounts) {
      results.push(await this.computeSnapshotForAccount(a.id));
    }
    return results;
  }

  async listSnapshots(accountId?: string) {
    const where = accountId ? { accountId } : {};
    return this.prisma.pnlSnapshot.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}

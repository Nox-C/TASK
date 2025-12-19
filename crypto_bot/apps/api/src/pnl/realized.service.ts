import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Decimal from 'decimal.js';

export type FillRecord = {
  id: string;
  side: 'buy' | 'sell';
  qty: string | number; // decimal as string
  price: string | number;
  feeAmount?: string | number;
  feeAsset?: string | null;
};

@Injectable()
export class RealizedService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Pure helper that computes realized pnl from an array of fills using FIFO.
   * Returns { realized: Decimal, details }
   */
  computeRealizedFromFills(fills: FillRecord[]) {
    const { computeRealizedFromFills: helper } = require('./realized.helper');
    return helper(fills as any);
  }

  async computeRealizedForAccount(accountId: string) {
    // Pull fills for the account (join through orders)
    const fills = await this.prisma.fill.findMany({ where: { order: { accountId } }, include: { order: true }, orderBy: { createdAt: 'asc' } as any });
    // group by symbol and account; for MVP process per symbol
    const bySymbol: Record<string, FillRecord[]> = {};
    for (const f of fills) {
      const symbol = f.order.symbol;
      if (!bySymbol[symbol]) bySymbol[symbol] = [];
      bySymbol[symbol].push({ id: f.id, side: f.order.side as any, qty: (f.qty as any).toString(), price: (f.price as any).toString(), feeAmount: f.feeAmount ? (f.feeAmount as any).toString() : undefined, feeAsset: f.feeAsset });
    }

    const result: Record<string, any> = {};
    for (const s of Object.keys(bySymbol)) {
      result[s] = this.computeRealizedFromFills(bySymbol[s]);
    }

    return result;
  }
}

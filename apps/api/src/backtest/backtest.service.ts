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

@Injectable()
export class BacktestService {
  constructor(private readonly market: MarketService, private readonly orders: OrdersService, private readonly prisma: PrismaService) {}

  async runReplay(symbol: string, opts: { fromTs?: string; toTs?: string; delayMs?: number }, rules: Rule[] = [], opts2: { persist?: boolean; startBalances?: any[]; startPositions?: any[] } = {}) {
    return runReplayCore(this.market, this.orders, this.prisma, symbol, opts, rules, opts2);
  }
}

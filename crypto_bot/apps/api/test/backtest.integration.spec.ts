import { describe, it, expect } from 'vitest';

import { runReplayCore } from '../src/backtest/core';

// Mocks
class MockMarketService {
  async ingestTick(t:any) { return t; }
  async replayTicksFromDb(symbol: string, opts: any, handler: any) {
    const ticks = [
      { symbol, price: '90', ts: new Date().toISOString() },
      { symbol, price: '95', ts: new Date().toISOString() },
      { symbol, price: '85', ts: new Date().toISOString() },
    ];
    for (const t of ticks) {
      await handler(t);
    }
    return ticks.length;
  }
}

class MockOrdersService {
  calls: any[] = [];
  async placeOrder(order: any) {
    this.calls.push(order);
    return { orderId: `o-${this.calls.length}`, fill: { id: `f-${this.calls.length}`, qty: order.qty, price: order.price } };
  }
}

describe('Backtest core persisted run (integration-style)', () => {
  it('creates backtest account and places orders', async () => {
    const mockMarket = new MockMarketService();
    const mockOrders = new MockOrdersService();
    const state: any = { balances: [], positions: [], runs: [] };
    const mockPrisma = {
      account: { create: async (d:any)=> ({ id: 'acct-1', ...d.data }) },
      balance: {
        create: async (d:any)=> { state.balances.push({ ...d.data }); return d.data; },
        findMany: async ({ where }: any)=> state.balances.filter((b:any)=> b.accountId === where.accountId),
      },
      position: {
        create: async (d:any)=> { state.positions.push({ ...d.data }); return d.data; },
        findMany: async ({ where }: any)=> state.positions.filter((p:any)=> p.accountId === where.accountId),
      },
      backtestRun: {
        create: async (d:any)=> { const rec = { id: `run-${state.runs.length+1}`, ...d.data }; state.runs.push(rec); return rec; }
      },
      fill: { findMany: async ()=> [] },
    } as any;

    const res = await runReplayCore(mockMarket as any, mockOrders as any, mockPrisma as any, 'BTC', { fromTs: undefined, toTs: undefined, delayMs: 0 }, [{ symbol: 'BTC', type: 'buy_below', threshold: '100', qty: 1 }], { persist: true, startBalances: [{ asset: 'USD', amount: 10000 }] });

    expect(res.ticksPlayed).toBe(3);
    expect(res.ordersPlaced).toBeGreaterThan(0);
  });
});

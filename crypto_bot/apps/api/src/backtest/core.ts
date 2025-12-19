import { MemoryLedger } from './memory-ledger';
import { MemoryOrdersService } from './memory-orders.service';

export async function runReplayCore(market: any, orders: any, prisma: any, symbol: string, opts: any, rules: any[] = [], opts2: any = {}) {
  let ordersPlaced = 0;

  const memoryLedger = new MemoryLedger();
  memoryLedger.initBalances(opts2.startBalances || [{ asset: 'USD', amount: 10000 }]);
  memoryLedger.initPositions(opts2.startPositions || []);
  const memOrders = new MemoryOrdersService(memoryLedger);

  let backtestAccountId: string | null = null;
  if (opts2.persist) {
    const acct = await prisma.account.create({ data: { ownerId: 'backtest', name: `backtest-${Date.now()}`, isBacktest: true } });
    backtestAccountId = acct.id;
    for (const b of (opts2.startBalances || [{ asset: 'USD', amount: 10000 }])) {
      await prisma.balance.create({ data: { accountId: acct.id, asset: b.asset, amount: Number(b.amount) } });
    }
    for (const p of (opts2.startPositions || [])) {
      await prisma.position.create({ data: { accountId: acct.id, symbol: p.symbol, qty: Number(p.qty), avgPrice: Number(p.avgPrice || 0) } });
    }
  }

  const handler = async (t:any) => {
    await market.ingestTick({ symbol: t.symbol, price: t.price as any, ts: t.ts });

    for (const r of rules) {
      if (r.symbol !== t.symbol) continue;
      const price = Number(t.price);
      const threshold = Number(r.threshold);
      if (r.type === 'buy_below' && price < threshold) {
        if (backtestAccountId) {
          await orders.placeOrder({ accountId: backtestAccountId, symbol: r.symbol, side: 'buy', qty: r.qty, price: price } as any);
        } else {
          await memOrders.placeOrder({ symbol: r.symbol, side: 'buy', qty: r.qty, price });
        }
        ordersPlaced++;
      }
      if (r.type === 'sell_above' && price > threshold) {
        if (backtestAccountId) {
          await orders.placeOrder({ accountId: backtestAccountId, symbol: r.symbol, side: 'sell', qty: r.qty, price: price } as any);
        } else {
          await memOrders.placeOrder({ symbol: r.symbol, side: 'sell', qty: r.qty, price });
        }
        ordersPlaced++;
      }
    }
  };

  const count = await market.replayTicksFromDb(symbol, { fromTs: opts.fromTs, toTs: opts.toTs, delayMs: opts.delayMs }, handler);

  const report: any = { ticksPlayed: count, ordersPlaced };
  if (!backtestAccountId) {
    report.balances = Array.from(memoryLedger.balances.entries()).map(([asset, amount]) => ({ asset, amount: amount.toFixed(10) }));
    report.positions = Array.from(memoryLedger.positions.values()).map(p => ({ symbol: p.symbol, qty: p.qty.toFixed(10), avgPrice: p.avgPrice.toFixed(10) }));
    report.fills = memoryLedger.fills.map(f => ({ id: f.id, symbol: f.symbol, qty: f.qty.toFixed(10), price: f.price.toFixed(10), ts: f.ts }));
  } else {
    report.balances = await prisma.balance.findMany({ where: { accountId: backtestAccountId } });
    report.positions = await prisma.position.findMany({ where: { accountId: backtestAccountId } });
    report.fills = await prisma.fill.findMany({ where: { order: { accountId: backtestAccountId } } as any });
  }

  if (opts2.persist) {
    await prisma.backtestRun.create({ data: { name: `run-${Date.now()}`, sourceAccountId: null, backtestAccountId, params: { symbol, rules, opts }, report } });
  }

  return report;
}

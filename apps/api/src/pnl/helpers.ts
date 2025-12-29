import Decimal from 'decimal.js';

export function computeSnapshotFromData(balances: Array<{ asset: string; amount: string | number }>, positions: Array<{ symbol: string; qty: string | number; avgPrice?: string | number }>, latestTicks: Record<string, { price: string | number }>, realizedBySymbol: Record<string, any>) {
  let realizedTotal = new Decimal(0);
  for (const s of Object.keys(realizedBySymbol || {})) {
    realizedTotal = realizedTotal.add(new Decimal((realizedBySymbol[s].realized as any) || 0));
  }

  let unrealized = new Decimal(0);
  let positionsValue = new Decimal(0);
  for (const p of positions || []) {
    const tick = latestTicks[p.symbol];
    if (!tick) continue;
    const price = new Decimal((tick.price as any).toString());
    const qty = new Decimal((p.qty as any).toString());
    positionsValue = positionsValue.add(qty.mul(price));
    const avg = new Decimal((p.avgPrice as any).toString());
    unrealized = unrealized.add(price.sub(avg).mul(qty));
  }

  const balancesValue = balances.reduce((s, b) => s.add(new Decimal((b.amount as any).toString())), new Decimal(0));
  const totalValue = balancesValue.add(positionsValue);

  return {
    realizedPnl: realizedTotal.toFixed(10),
    unrealizedPnl: unrealized.toFixed(10),
    totalValue: totalValue.toFixed(10),
  };
}

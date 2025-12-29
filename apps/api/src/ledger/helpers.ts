import Decimal from 'decimal.js';

export function computeBalancesFromRows(rows: Array<{ asset: string; debit: string | number; credit: string | number }>) {
  const map: Record<string, Decimal> = {};
  for (const r of rows) {
    const a = r.asset;
    const debit = new Decimal((r.debit as any).toString());
    const credit = new Decimal((r.credit as any).toString());
    if (!map[a]) map[a] = new Decimal(0);
    map[a] = map[a].add(debit).sub(credit);
  }

  const out: Record<string, string> = {};
  for (const k of Object.keys(map)) {
    out[k] = map[k].toFixed(10);
  }
  return out;
}

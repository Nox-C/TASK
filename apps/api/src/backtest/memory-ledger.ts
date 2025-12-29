import Decimal from 'decimal.js';

export type MemBalance = { asset: string; amount: Decimal };
export type MemPosition = { symbol: string; qty: Decimal; avgPrice: Decimal };
export type MemFill = { id: string; orderId?: string; symbol: string; qty: Decimal; price: Decimal; feeAmount?: Decimal; ts: string };

export class MemoryLedger {
  balances: Map<string, Decimal> = new Map();
  positions: Map<string, MemPosition> = new Map();
  fills: MemFill[] = [];
  ledgerEntries: any[] = [];

  initBalances(balances: Array<{ asset: string; amount: string | number }>) {
    this.balances = new Map();
    for (const b of balances) this.balances.set(b.asset, new Decimal(b.amount as any));
  }

  initPositions(positions: Array<{ symbol: string; qty: string | number; avgPrice?: string | number }>) {
    this.positions = new Map();
    for (const p of positions) {
      this.positions.set(p.symbol, { symbol: p.symbol, qty: new Decimal(p.qty as any), avgPrice: new Decimal((p.avgPrice || 0) as any) });
    }
  }

  placeFill(symbol: string, qty: number | string | Decimal, price: number | string | Decimal, feeAmount?: number | string | Decimal) {
    const q = new Decimal(qty as any);
    const p = new Decimal(price as any);
    const f = feeAmount ? new Decimal(feeAmount as any) : undefined;
    const fill: MemFill = { id: `mem-${this.fills.length + 1}`, symbol, qty: q, price: p, feeAmount: f, ts: new Date().toISOString() };
    this.fills.push(fill);

    // update position
    const existing = this.positions.get(symbol);
    if (!existing) {
      const newQty = q;
      const avgPrice = p;
      this.positions.set(symbol, { symbol, qty: newQty, avgPrice });
    } else {
      const newQty = existing.qty.add(q);
      const newAvg = existing.qty.eq(0) ? p : existing.avgPrice.mul(existing.qty).add(p.mul(q)).div(newQty);
      this.positions.set(symbol, { symbol, qty: newQty, avgPrice: newAvg });
    }

    // update base currency balance (assume USD)
    const cost = p.mul(q).neg();
    const base = this.balances.get('USD') || new Decimal(0);
    this.balances.set('USD', base.add(cost));

    if (f) {
      const baseAfterFee = this.balances.get('USD') || new Decimal(0);
      this.balances.set('USD', baseAfterFee.sub(f));
    }

    // simple ledger entry
    this.ledgerEntries.push({ id: `le-${this.ledgerEntries.length + 1}`, asset: symbol, debit: '0', credit: p.mul(q).toFixed(10), ts: new Date().toISOString() });

    return fill;
  }

  getPosition(symbol: string) {
    return this.positions.get(symbol);
  }

  getBalance(asset: string) {
    return this.balances.get(asset) || new Decimal(0);
  }

  computeUnrealized(symbol: string, price: number | string | Decimal) {
    const pos = this.positions.get(symbol);
    if (!pos) return new Decimal(0);
    const p = new Decimal(price as any);
    return p.sub(pos.avgPrice).mul(pos.qty);
  }

  computeRealized() {
    // naive realized: sum of (fill.price - avg at time) for sells — simplified for demo
    // A full FIFO engine lives in RealizedService; here we return sum of negative positions closed.
    return this.fills.reduce((acc, f) => acc.add((f.price as Decimal).mul(f.qty).neg()), new Decimal(0));
  }
}

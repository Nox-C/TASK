import Decimal from 'decimal.js';

export type FillRecord = {
  id: string;
  side: 'buy' | 'sell';
  qty: string | number; // decimal as string
  price: string | number;
  feeAmount?: string | number;
  feeAsset?: string | null;
};

export function computeRealizedFromFills(fills: FillRecord[]) {
  const lots: Array<{ qty: Decimal; cost: Decimal }> = [];
  let realized = new Decimal(0);
  const details: any[] = [];

  for (const f of fills) {
    const qty = new Decimal(f.qty as any);
    const price = new Decimal(f.price as any);
    const fee = f.feeAmount ? new Decimal(f.feeAmount as any) : new Decimal(0);

    if (f.side === 'buy') {
      lots.push({ qty, cost: price });
    } else {
      // sell: consume lots FIFO
      let remaining = qty;
      while (remaining.gt(0) && lots.length > 0) {
        const lot = lots[0];
        const match = Decimal.min(lot.qty, remaining);
        const pnl = match.mul(price.sub(lot.cost));
        const feeAlloc = fee.mul(match.div(qty));
        const net = pnl.sub(feeAlloc);
        realized = realized.add(net);
        details.push({ matched: match.toFixed(), cost: lot.cost.toFixed(), price: price.toFixed(), pnl: pnl.toFixed(), feeAlloc: feeAlloc.toFixed(), net: net.toFixed() });

        lot.qty = lot.qty.sub(match);
        if (lot.qty.lte(0)) lots.shift();
        remaining = remaining.sub(match);
      }

      if (remaining.gt(0)) {
        const pnl = remaining.mul(price);
        realized = realized.add(pnl);
        details.push({ matched: remaining.toFixed(), cost: '0', price: price.toFixed(), pnl: pnl.toFixed(), feeAlloc: fee.toFixed(), net: pnl.sub(fee).toFixed() });
      }
    }
  }

  return { realized: realized.toFixed(10), details };
}

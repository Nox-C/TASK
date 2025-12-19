import { describe, it, expect } from 'vitest';
import { MemoryLedger } from '../src/backtest/memory-ledger';
import { MemoryOrdersService } from '../src/backtest/memory-orders.service';

describe('Backtest in-memory simulation', () => {
  it('places buys when price below threshold and updates balances/positions', async () => {
    const ledger = new MemoryLedger();
    ledger.initBalances([{ asset: 'USD', amount: 10000 }]);
    ledger.initPositions([]);
    const orders = new MemoryOrdersService(ledger);

    await orders.placeOrder({ symbol: 'BTC', side: 'buy', qty: 1, price: 100 });

    const pos = ledger.getPosition('BTC');
    expect(pos).toBeDefined();
    expect(pos!.qty.toNumber()).toBe(1);
    expect(ledger.getBalance('USD').toNumber()).toBeCloseTo(10000 - 100, 6);
  });
});

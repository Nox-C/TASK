import { describe, it } from 'vitest';
import assert from 'assert';
import { computeSnapshotFromData } from '../src/pnl/helpers';

// Mock data
const balances = [{ asset: 'USD', amount: '1000' }];
const positions = [{ accountId: 'a1', symbol: 'BTC', qty: '1', avgPrice: '100' }];
const latestTicks = { BTC: { symbol: 'BTC', price: '200', ts: new Date() } };
const realizedBySymbol = { BTC: { realized: '50', details: [] } };

describe('computeSnapshotFromData', () => {
  it('computes realized/unrealized/total', () => {
    const snap = computeSnapshotFromData(balances as any, positions as any, latestTicks as any, realizedBySymbol as any);
    assert.strictEqual(snap.realizedPnl, '50.0000000000');
    assert.strictEqual(snap.unrealizedPnl, '100.0000000000');
    assert.strictEqual(snap.totalValue, '1200.0000000000');
  });
});

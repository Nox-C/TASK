import { describe, it } from 'vitest';
import assert from 'assert';
import { computeRealizedFromFills } from '../src/pnl/realized.helper';

// Test the pure helper

describe('RealizedService - FIFO', () => {
  it('computes realized PnL for simple buy then sell', () => {
    const fills = [
      { id: 'f1', side: 'buy', qty: '10', price: '100' },
      { id: 'f2', side: 'sell', qty: '5', price: '110', feeAmount: '1' },
    ];
    const { realized, details } = computeRealizedFromFills(fills as any);
    // buy 10@100, sell 5@110 -> gross pnl = 5*(110-100)=50, fee allocated proportionally ~1*(5/5)=1 -> net 49
    assert.strictEqual(parseFloat(realized).toFixed(2), '49.00');
  });

  it('handles multiple lots FIFO', () => {
    const fills = [
      { id: 'f1', side: 'buy', qty: '10', price: '100' },
      { id: 'f2', side: 'buy', qty: '10', price: '120' },
      { id: 'f3', side: 'sell', qty: '15', price: '130', feeAmount: '2' },
    ];
    const { realized } = computeRealizedFromFills(fills as any);
    // matches 10@100 and 5@120: pnl = 10*(130-100) + 5*(130-120) = 300 + 50 = 350, fee -2 => 348
    assert.strictEqual(parseFloat(realized).toFixed(2), '348.00');
  });
});

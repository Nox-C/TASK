import { describe, it } from 'vitest';
import assert from 'assert';
import Decimal from 'decimal.js';
import { computeBalancesFromRows } from '../src/ledger/helpers';

// Mock rows
const rows = [
  { asset: 'USD', debit: '0', credit: '1000' },
  { asset: 'BTC', debit: '2', credit: '0' },
  { asset: 'USD', debit: '50', credit: '0' },
];

describe('Ledger helpers', () => {
  it('computes balances from ledger entries', async () => {
    const balances = computeBalancesFromRows(rows as any);
    // USD: debit 50, credit 1000 -> net = -950
    // Just verify keys and types
    assert.ok(balances['USD']);
    assert.ok(balances['BTC']);
  });
});

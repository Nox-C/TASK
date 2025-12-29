import { describe, it, expect } from 'vitest';
import { BacktestReportingService } from '../src/backtest/reporting.service';

const mockPrisma: any = {
  backtestRun: { findUnique: async ({ where }: any) => ({ id: where.id, params: { startBalances: [{ asset: 'USD', amount: 10000 }] }, report: { fills: [ { id: 'f1', symbol: 'BTC', qty: '1', price: '100', ts: '2020-01-01T00:00:00Z' }, { id: 'f2', symbol: 'BTC', qty: '-1', price: '150', ts: '2020-07-01T00:00:00Z' } ] } }) },
};

const rs = new BacktestReportingService(mockPrisma as any);

describe('BacktestReportingService returns percent & annualized metrics', () => {
  it('computes total return and annualized', async () => {
    const metrics = await rs.computeMetricsForRun('run-1');
    expect(metrics.trades).toBe(2);
    expect(metrics.totalReturn).toBeDefined();
    expect(metrics.pctReturn).toBeDefined();
    expect(metrics.annualizedReturn).toBeDefined();
    const csv = await rs.exportPnlSeriesCsv('run-1');
    expect(csv).toContain('ts,equity');
  });
});

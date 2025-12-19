import { describe, it, expect } from 'vitest';
import { BacktestReportingService } from '../src/backtest/reporting.service';

// Mock Prisma
const mockPrisma: any = {
  backtestRun: { findUnique: async ({ where }: any) => ({ id: where.id, report: { fills: [ { id: 'f1', symbol: 'BTC', qty: '1', price: '100', ts: new Date().toISOString() } ] } }) },
};

const rs = new BacktestReportingService(mockPrisma as any);

describe('BacktestReportingService', () => {
  it('computes metrics and export CSV', async () => {
    const metrics = await rs.computeMetricsForRun('run-1');
    expect(metrics.trades).toBe(1);
    const csv = await rs.exportRunCsv('run-1');
    expect(csv).toContain('id,symbol,qty,price,ts');
  });
});

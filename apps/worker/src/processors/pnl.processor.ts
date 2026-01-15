import fetch from 'node-fetch';
import { Job } from 'pg-boss';

interface PnlJobData {
  accountId?: string;
}

export function registerPnlCompute(boss: any) {
  boss.work('pnl.compute', async (job: Job<PnlJobData>) => {
    const { accountId } = job.data || {};
    try {
      const url = accountId ? `${process.env.API_BASE || 'http://localhost:3001'}/pnl/snapshots?accountId=${accountId}` : `${process.env.API_BASE || 'http://localhost:3001'}/pnl/snapshots`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      console.log('[worker] pnl.compute done', { accountId, resultCount: Array.isArray(data) ? data.length : 1 });
      return { ok: true };
    } catch (err) {
      console.error('[worker] pnl.compute failed', err);
      throw err;
    }
  });
}

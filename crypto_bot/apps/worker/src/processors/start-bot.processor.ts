import { Job } from 'pg-boss';

export function registerStartBot(boss: any) {
  boss.work('task.action.start_bot', async (job: Job) => {
    const { botId } = job.data || {};
    console.log('[worker] start_bot job received', { botId, data: job.data });

    // Placeholder: call API or update DB to mark bot running.
    // TODO: replace with real adapter call (ExecutionAdapter / BotService)

    // Simulate work
    await new Promise((r) => setTimeout(r, 500));

    console.log(`[worker] bot ${botId} started (simulated)`);
    return { ok: true };
  });
}

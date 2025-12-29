import { Job } from 'pg-boss';

export function registerStopBot(boss: any) {
  boss.work('task.action.stop_bot', async (job: Job) => {
    const { botId } = job.data || {};
    console.log('[worker] stop_bot job received', { botId, data: job.data });

    // Placeholder: call API or update DB to mark bot stopped.
    // TODO: replace with real adapter call (ExecutionAdapter / BotService)

    // Simulate work
    await new Promise((r) => setTimeout(r, 300));

    console.log(`[worker] bot ${botId} stopped (simulated)`);
    return { ok: true };
  });
}

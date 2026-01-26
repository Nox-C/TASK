import { Job } from 'pg-boss';

interface StopBotJobData {
  botId?: string;
}

export function registerStopBot(boss: any) {
  boss.work('task.action.stop_bot', async (job: Job<StopBotJobData>) => {
    const { botId } = job.data || {};
    console.log('[worker] stop_bot job received', { botId, data: job.data });

    // Call API to stop the bot
    try {
      const response = await fetch(`http://localhost:3002/bots/${botId}/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`[worker] bot ${botId} stopped successfully`, result);
      return { ok: true, result };
    } catch (error) {
      console.error(`[worker] failed to stop bot ${botId}`, error);
      // Optionally re-throw or handle the error to pg-boss
      throw error;
    }
  });
}

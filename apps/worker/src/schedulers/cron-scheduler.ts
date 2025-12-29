export function registerCronScheduler(boss: any) {
  // For MVP demo: enqueue a cron trigger job immediately and then every minute.
  const enqueue = async () => {
    try {
      console.log('[scheduler] enqueueing demo cron trigger');
      await boss.send('task.trigger.cron', { taskId: 'demo-cron-task', schedule: '*/1 * * * *' });
    } catch (err) {
      console.error('[scheduler] failed to enqueue cron job', err);
    }
  };

  // enqueue once immediately
  enqueue().catch(console.error);

  // and every minute (demo); in production use a proper cron library or pg-boss recurring jobs
  const id = setInterval(enqueue, 60_000);

  // schedule PnL compute as well
  const pnlId = setInterval(async () => {
    try {
      await boss.send('pnl.compute', {});
    } catch (err) {
      console.error('[scheduler] failed to enqueue pnl.compute', err);
    }
  }, 60_000); // every minute

  // return an object to allow teardown if desired
  return { stop: () => { clearInterval(id); clearInterval(pnlId); } };
}

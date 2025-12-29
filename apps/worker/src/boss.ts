import PgBoss from 'pg-boss';
import { registerStartBot } from './processors/start-bot.processor';
import { registerStopBot } from './processors/stop-bot.processor';
import { registerNotify } from './processors/notify.processor';
import { registerPnlCompute } from './processors/pnl.processor';
import { registerReplayProcessor } from './processors/replay.processor';
import { registerCronScheduler } from './schedulers/cron-scheduler';

async function start() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
  const boss = new PgBoss({ connectionString });
  await boss.start();
  console.log('pg-boss started');

  // register processors
  registerStartBot(boss);
  registerStopBot(boss);
  registerNotify(boss);
  registerPnlCompute(boss);
  registerReplayProcessor(boss);

  // register demo scheduler (enqueues cron triggers)
  registerCronScheduler(boss);

  console.log('[worker] processors and schedulers registered');
}

start().catch(err => { console.error(err); process.exit(1); });

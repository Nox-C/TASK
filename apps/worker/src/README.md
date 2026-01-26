# Worker: TASK runner + schedulers

This worker uses pg-boss to process TASK actions and triggers.

Queues registered (MVP):

- task.action.start_bot
- task.action.stop_bot
- task.action.notify
- task.trigger.cron (enqueued by the cron scheduler)

To run (requires DATABASE_URL env):
pnpm --filter worker start

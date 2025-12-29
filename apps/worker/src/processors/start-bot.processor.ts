import { ExecutionAdapter } from "@task/adapters";
import { Job } from "pg-boss";

export function registerStartBot(boss: any) {
  boss.work("task.action.start_bot", async (job: Job) => {
    const { botId } = job.data || {};
    console.log("[worker] start_bot job received", { botId, data: job.data });

    // Call execution adapter to start the bot
    const adapter = new ExecutionAdapter();
    await adapter.startBot(botId);

    return { ok: true };
  });
}

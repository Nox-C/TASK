import { BotExecutionAdapter } from "@task/adapters";
import { Job } from "pg-boss";

interface StartBotJobData {
  botId?: string;
}

export function registerStartBot(boss: any) {
  boss.work("task.action.start_bot", async (job: Job<StartBotJobData>) => {
    const { botId } = job.data || {};
    console.log("[worker] start_bot job received", { botId, data: job.data });

    // Call execution adapter to start the bot
    if (!botId) {
      throw new Error("botId is required");
    }
    const adapter = new BotExecutionAdapter();
    await adapter.startBot(botId);

    return { ok: true };
  });
}

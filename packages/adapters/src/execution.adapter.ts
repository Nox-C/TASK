import { PaperExecutionAdapter } from './paper/execution.adapter.js';

export class BotExecutionAdapter {
  private adapter: PaperExecutionAdapter;

  constructor() {
    this.adapter = new PaperExecutionAdapter();
  }

  async startBot(botId: string) {
    console.log(`[BotExecutionAdapter] Starting bot ${botId}`);
    // Placeholder implementation
    return { success: true, botId };
  }

  async stopBot(botId: string) {
    console.log(`[BotExecutionAdapter] Stopping bot ${botId}`);
    // Placeholder implementation
    return { success: true, botId };
  }

  async placeOrder(order: any) {
    return this.adapter.placeOrder(order);
  }

  async cancelOrder(orderId: string) {
    return this.adapter.cancelOrder(orderId);
  }
}

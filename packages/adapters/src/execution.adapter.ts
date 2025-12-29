import { PaperExecutionAdapter } from './paper/execution.adapter.js';

export class ExecutionAdapter {
  private adapter: PaperExecutionAdapter;

  constructor() {
    this.adapter = new PaperExecutionAdapter();
  }

  async startBot(botId: string) {
    console.log(`[ExecutionAdapter] Starting bot ${botId}`);
    // Placeholder implementation
    return { success: true, botId };
  }

  async stopBot(botId: string) {
    console.log(`[ExecutionAdapter] Stopping bot ${botId}`);
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
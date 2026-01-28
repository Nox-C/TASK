import { BacktestResult, GridBot } from '../../../shared/types/trading';

export class BotExecutionService {
  private static instance: BotExecutionService;
  private bots: Map<string, GridBot> = new Map();
  private backtestResults: BacktestResult[] = [];

  static getInstance(): BotExecutionService {
    if (!BotExecutionService.instance) {
      BotExecutionService.instance = new BotExecutionService();
    }
    return BotExecutionService.instance;
  }

  // Bot CRUD operations
  createBot(botData: Omit<GridBot, 'id' | 'createdAt' | 'updatedAt'>): GridBot {
    const bot: GridBot = {
      ...botData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bots.set(bot.id, bot);
    return bot;
  }

  updateBot(id: string, updates: Partial<GridBot>): GridBot | null {
    const bot = this.bots.get(id);
    if (!bot) return null;

    const updatedBot = {
      ...bot,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.bots.set(id, updatedBot);
    return updatedBot;
  }

  deleteBot(id: string): boolean {
    return this.bots.delete(id);
  }

  getBot(id: string): GridBot | null {
    return this.bots.get(id) || null;
  }

  getAllBots(): GridBot[] {
    return Array.from(this.bots.values());
  }

  // Bot execution
  startBot(id: string): boolean {
    const bot = this.bots.get(id);
    if (!bot) return false;

    this.updateBot(id, { status: 'RUNNING', isActive: true });
    return true;
  }

  stopBot(id: string): boolean {
    const bot = this.bots.get(id);
    if (!bot) return false;

    this.updateBot(id, { status: 'STOPPED', isActive: false });
    return true;
  }

  // Backtesting
  async runBacktest(botId: string, startDate: string, endDate: string): Promise<BacktestResult> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error('Bot not found');
    }

    // Simulate backtest execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result: BacktestResult = {
      id: Date.now().toString(),
      botId,
      startDate,
      endDate,
      totalReturn: (Math.random() - 0.5) * 50, // -25% to +25%
      maxDrawdown: Math.random() * 20, // 0% to 20%
      sharpeRatio: Math.random() * 3 - 1, // -1 to 2
      winRate: Math.random() * 40 + 30, // 30% to 70%
      totalTrades: Math.floor(Math.random() * 100) + 10, // 10 to 110
      averageWin: Math.random() * 50 + 10, // 10 to 60
      averageLoss: Math.random() * 30 + 5, // 5 to 35
      profitFactor: Math.random() * 2 + 0.5 // 0.5 to 2.5
    };

    this.backtestResults.push(result);
    return result;
  }

  getBacktestResults(botId?: string): BacktestResult[] {
    if (botId) {
      return this.backtestResults.filter(result => result.botId === botId);
    }
    return this.backtestResults;
  }

  // Grid level management
  updateGridLevels(botId: string): boolean {
    const bot = this.bots.get(botId);
    if (!bot) return false;

    const levels = Array.from({ length: bot.gridCount }, (_, i) => {
      const price = bot.lowerPrice + (i * (bot.upperPrice - bot.lowerPrice) / (bot.gridCount - 1));
      return {
        price,
        type: i % 2 === 0 ? 'BUY' as const : 'SELL' as const,
        status: 'PENDING' as const
      };
    });

    this.updateBot(botId, { levels });
    return true;
  }

  // Simulate grid execution
  simulateGridExecution(botId: string): void {
    const bot = this.bots.get(botId);
    if (!bot || bot.status !== 'RUNNING') return;

    // Randomly fill some grid levels
    const updatedLevels = bot.levels.map(level => ({
      ...level,
      status: Math.random() > 0.7 ? 'FILLED' as const : 'PENDING' as const
    }));

    // Calculate P&L based on filled levels
    const filledLevels = updatedLevels.filter(level => level.status === 'FILLED');
    const pnl = filledLevels.reduce((total, level) => {
      const profit = level.type === 'BUY' ? 10 : -10; // Simplified P&L calculation
      return total + profit;
    }, 0);

    this.updateBot(botId, { 
      levels: updatedLevels, 
      totalPnl: bot.totalPnl + pnl,
      updatedAt: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const botExecutionService = BotExecutionService.getInstance();

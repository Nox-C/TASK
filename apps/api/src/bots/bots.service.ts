import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBotDto } from "./dto/create-bot.dto";
import { UpdateBotDto } from "./dto/update-bot.dto";

export interface ManualBotRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: ManualBotCondition[];
  actions: ManualBotAction[];
  priority: number;
}

export interface ManualBotCondition {
  id: string;
  name: string;
  type:
    | "price_above"
    | "price_below"
    | "price_crosses_above"
    | "price_crosses_below"
    | "volume_above"
    | "volume_below"
    | "time_based"
    | "indicator_based";
  parameters: Record<string, any>;
  timeframe: string;
}

export interface ManualBotAction {
  id: string;
  name: string;
  type:
    | "buy"
    | "sell"
    | "close_long"
    | "close_short"
    | "adjust_stop_loss"
    | "adjust_take_profit"
    | "send_notification";
  parameters: Record<string, any>;
}

export interface ManualBot {
  id: string;
  name: string;
  description: string;
  symbol: string;
  isActive: boolean;
  rules: ManualBotRule[];
  riskManagement: {
    maxPositionSize: number;
    stopLoss: number;
    takeProfit: number;
    maxDailyLoss: number;
    maxOpenPositions: number;
  };
  execution: {
    executionType: "market" | "limit";
    slippage: number;
    commission: number;
  };
  schedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    daysOfWeek: string[];
  };
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BotsService {
  private manualBots: ManualBot[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {
    this.manualBots = [];
  }

  async create(dto: CreateBotDto, ownerId: string) {
    const bot = await this.prisma.bot.create({
      data: {
        name: dto.name,
        strategyId: dto.strategyId,
        ownerId,
        active: dto.active ?? false,
      },
    });

    await this.audit.record(ownerId, "user", "bot.create", {
      botId: bot.id,
      name: bot.name,
    });

    return bot;
  }

  async findAll(ownerId?: string) {
    const where = ownerId ? { ownerId } : {};
    return this.prisma.bot.findMany({ where });
  }

  async findById(id: string) {
    const bot = await this.prisma.bot.findUnique({ where: { id } });
    if (!bot) throw new NotFoundException();
    return bot;
  }

  async update(id: string, dto: UpdateBotDto) {
    const bot = await this.findById(id);
    return this.prisma.bot.update({ where: { id }, data: dto });
  }

  async start(id: string, actorId: string | null = null) {
    const bot = await this.findById(id);
    if (!bot) throw new NotFoundException();

    const run = await this.prisma.botRun.create({
      data: { botId: id, status: "running" },
    });
    await this.prisma.bot.update({ where: { id }, data: { active: true } });

    await this.audit.record(actorId, actorId ? "user" : "system", "bot.start", {
      botId: id,
      runId: run.id,
    });

    return { bot, run };
  }

  async stop(id: string, actorId: string | null = null) {
    const bot = await this.findById(id);
    if (!bot) throw new NotFoundException();

    // find last running run
    const run = await this.prisma.botRun.findFirst({
      where: { botId: id, status: "running" },
      orderBy: { startedAt: "desc" },
    });
    if (run) {
      await this.prisma.botRun.update({
        where: { id: run.id },
        data: { stoppedAt: new Date(), status: "stopped" },
      });
    }

    await this.prisma.bot.update({ where: { id }, data: { active: false } });
    await this.audit.record(actorId, actorId ? "user" : "system", "bot.stop", {
      botId: id,
      runId: run?.id,
    });

    return { bot, run };
  }

  // Manual Bot Methods
  async createManualBot(
    botData: Omit<ManualBot, "id" | "ownerId" | "createdAt" | "updatedAt">,
    ownerId: string
  ): Promise<ManualBot> {
    const manualBot: ManualBot = {
      ...botData,
      id: `manual-${Date.now()}`,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.manualBots.push(manualBot);
    await this.audit.record(ownerId, "user", "manual-bot.create", {
      botId: manualBot.id,
      name: manualBot.name,
    });

    return manualBot;
  }

  async getManualBots(ownerId?: string): Promise<ManualBot[]> {
    if (ownerId) {
      return this.manualBots.filter((bot) => bot.ownerId === ownerId);
    }
    return this.manualBots;
  }

  async getManualBot(id: string): Promise<ManualBot | null> {
    return this.manualBots.find((bot) => bot.id === id) || null;
  }

  async updateManualBot(
    id: string,
    updateData: Partial<ManualBot>
  ): Promise<ManualBot> {
    const botIndex = this.manualBots.findIndex((bot) => bot.id === id);
    if (botIndex === -1) throw new NotFoundException("Manual bot not found");

    this.manualBots[botIndex] = {
      ...this.manualBots[botIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    return this.manualBots[botIndex];
  }

  async deleteManualBot(id: string): Promise<void> {
    const botIndex = this.manualBots.findIndex((bot) => bot.id === id);
    if (botIndex === -1) throw new NotFoundException("Manual bot not found");

    const bot = this.manualBots[botIndex];
    this.manualBots.splice(botIndex, 1);
    await this.audit.record(bot.ownerId, "user", "manual-bot.delete", {
      botId: id,
    });
  }

  async activateManualBot(id: string): Promise<ManualBot> {
    const bot = await this.getManualBot(id);
    if (!bot) throw new NotFoundException("Manual bot not found");

    return this.updateManualBot(id, { isActive: true });
  }

  async deactivateManualBot(id: string): Promise<ManualBot> {
    const bot = await this.getManualBot(id);
    if (!bot) throw new NotFoundException("Manual bot not found");

    return this.updateManualBot(id, { isActive: false });
  }

  async validateManualBot(
    botData: ManualBot
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!botData.name?.trim()) {
      errors.push("Bot name is required");
    }

    if (!botData.symbol?.trim()) {
      errors.push("Trading symbol is required");
    }

    if (!botData.rules || botData.rules.length === 0) {
      errors.push("At least one rule is required");
    }

    for (const rule of botData.rules) {
      if (!rule.conditions || rule.conditions.length === 0) {
        errors.push(`Rule "${rule.name}" must have at least one condition`);
      }
      if (!rule.actions || rule.actions.length === 0) {
        errors.push(`Rule "${rule.name}" must have at least one action`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async executeManualBotRules(
    id: string
  ): Promise<{ executed: boolean; actions: string[] }> {
    const bot = await this.getManualBot(id);
    if (!bot || !bot.isActive) {
      return { executed: false, actions: [] };
    }

    const executedActions: string[] = [];

    for (const rule of bot.rules.filter((r) => r.enabled)) {
      const conditionsMet = await this.evaluateRuleConditions(
        rule.conditions,
        bot.symbol
      );

      if (conditionsMet) {
        for (const action of rule.actions) {
          await this.executeAction(action, bot.symbol);
          executedActions.push(`Executed ${action.type} for rule ${rule.name}`);
        }
      }
    }

    return { executed: executedActions.length > 0, actions: executedActions };
  }

  private async evaluateRuleConditions(
    conditions: ManualBotCondition[],
    symbol: string
  ): Promise<boolean> {
    // Real condition evaluation - fetch actual market data
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.replace(
          "-",
          ""
        )}`
      );
      const data: any = await response.json();
      const currentPrice = parseFloat(data.price);

      // Example condition: check if price is above 50-day moving average (simplified)
      return currentPrice > 50000; // Simplified BTC price check
    } catch (error) {
      console.error(
        "Failed to fetch market data for condition evaluation:",
        error
      );
      return false;
    }
  }

  private async executeAction(
    action: ManualBotAction,
    symbol: string
  ): Promise<void> {
    // Simplified action execution - in real implementation would place orders
    console.log(
      `Executing action ${action.type} for ${symbol} with params:`,
      action.parameters
    );
  }
}

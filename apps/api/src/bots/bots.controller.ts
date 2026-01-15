import {
  Body,
  Controller,
  Delete,
  Get,
  OnModuleInit,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Server } from "socket.io";
import { BotsService, ManualBot } from "./bots.service";
import { CreateBotDto } from "./dto/create-bot.dto";
import { UpdateBotDto } from "./dto/update-bot.dto";

@Controller("bots")
export class BotsController implements OnModuleInit {
  private wsServer: Server | null = null;

  constructor(private readonly bots: BotsService) {}

  onModuleInit() {
    // Get WebSocket server instance
    const { WsGateway } = require("../ws/ws.gateway");
    if (WsGateway.instance) {
      this.wsServer = WsGateway.instance.server;
    }
  }

  private emitBotEvent(type: string, data: any) {
    if (this.wsServer) {
      this.wsServer.emit("bot_event", {
        type: "bot",
        message: data.message || type,
        payload: data,
        ts: Date.now(),
      });
    }
  }

  @Post()
  async create(@Body() dto: CreateBotDto, @Query("ownerId") ownerId?: string) {
    // In a real app we'd derive ownerId from auth token; for MVP ownerId may be passed or defaulted
    const owner = ownerId || null;
    const bot = await this.bots.create(dto, owner as any);

    // Emit WebSocket event
    this.emitBotEvent("bot_created", {
      botId: bot.id,
      name: bot.name,
      message: `Bot ${bot.name} created`,
    });

    return bot;
  }

  @Get()
  async list(@Query("ownerId") ownerId?: string) {
    return this.bots.findAll(ownerId as any);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return this.bots.findById(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateBotDto) {
    return this.bots.update(id, dto);
  }

  @Post(":id/start")
  async start(@Param("id") id: string, @Query("actorId") actorId?: string) {
    const result = await this.bots.start(id, actorId ?? null);

    // Emit WebSocket event
    this.emitBotEvent("bot_started", {
      botId: id,
      message: `Bot ${id} started`,
    });

    return result;
  }

  @Post(":id/stop")
  async stop(@Param("id") id: string, @Query("actorId") actorId?: string) {
    const result = await this.bots.stop(id, actorId ?? null);

    // Emit WebSocket event
    this.emitBotEvent("bot_stopped", {
      botId: id,
      message: `Bot ${id} stopped`,
    });

    return result;
  }

  // Manual Bot Endpoints
  @Post("manual")
  async createManualBot(
    @Body()
    botData: Omit<ManualBot, "id" | "ownerId" | "createdAt" | "updatedAt">,
    @Query("ownerId") ownerId?: string
  ) {
    return this.bots.createManualBot(botData, ownerId || "default-user");
  }

  @Get("manual")
  async getManualBots(@Query("ownerId") ownerId?: string) {
    return this.bots.getManualBots(ownerId);
  }

  @Get("manual/:id")
  async getManualBot(@Param("id") id: string) {
    return this.bots.getManualBot(id);
  }

  @Patch("manual/:id")
  async updateManualBot(
    @Param("id") id: string,
    @Body() updateData: Partial<ManualBot>
  ) {
    return this.bots.updateManualBot(id, updateData);
  }

  @Delete("manual/:id")
  async deleteManualBot(@Param("id") id: string) {
    await this.bots.deleteManualBot(id);
    return { message: "Manual bot deleted successfully" };
  }

  @Post("manual/:id/activate")
  async activateManualBot(@Param("id") id: string) {
    return this.bots.activateManualBot(id);
  }

  @Post("manual/:id/deactivate")
  async deactivateManualBot(@Param("id") id: string) {
    return this.bots.deactivateManualBot(id);
  }

  @Post("manual/validate")
  async validateManualBot(@Body() botData: ManualBot) {
    return this.bots.validateManualBot(botData);
  }

  @Post("manual/:id/execute")
  async executeManualBotRules(@Param("id") id: string) {
    return this.bots.executeManualBotRules(id);
  }
}

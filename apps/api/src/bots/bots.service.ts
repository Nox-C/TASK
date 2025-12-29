import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BotsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async create(dto: CreateBotDto, ownerId: string) {
    const bot = await this.prisma.bot.create({
      data: {
        name: dto.name,
        strategyId: dto.strategyId,
        ownerId,
        active: dto.active ?? false,
      },
    });

    await this.audit.record(ownerId, 'user', 'bot.create', { botId: bot.id, name: bot.name });

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

    const run = await this.prisma.botRun.create({ data: { botId: id, status: 'running' } });
    await this.prisma.bot.update({ where: { id }, data: { active: true } });

    await this.audit.record(actorId, actorId ? 'user' : 'system', 'bot.start', { botId: id, runId: run.id });

    return { bot, run };
  }

  async stop(id: string, actorId: string | null = null) {
    const bot = await this.findById(id);
    if (!bot) throw new NotFoundException();

    // find last running run
    const run = await this.prisma.botRun.findFirst({ where: { botId: id, status: 'running' }, orderBy: { startedAt: 'desc' } });
    if (run) {
      await this.prisma.botRun.update({ where: { id: run.id }, data: { stoppedAt: new Date(), status: 'stopped' } });
    }

    await this.prisma.bot.update({ where: { id }, data: { active: false } });
    await this.audit.record(actorId, actorId ? 'user' : 'system', 'bot.stop', { botId: id, runId: run?.id });

    return { bot, run };
  }
}

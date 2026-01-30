import { Injectable } from '@nestjs/common';
import { prisma } from '@task/database';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';

@Injectable()
export class BotsService {
  async findAll() {
    return prisma.bot.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMetrics() {
    const bots = await prisma.bot.findMany();
    const activeBots = bots.filter((b: any) => b.status === 'RUNNING');
    const totalPnl = bots.reduce((sum: number, b: any) => sum + Number(b.totalPnl), 0);
    
    return {
      totalBots: bots.length,
      activeBots: activeBots.length,
      totalPnl,
      winRate: 0, // Calculate from orders
    };
  }

  async findOne(id: number) {
    return prisma.bot.findUnique({ where: { id } });
  }

  async create(createBotDto: CreateBotDto) {
    return prisma.bot.create({
      data: createBotDto,
    });
  }

  async update(id: number, updateBotDto: UpdateBotDto) {
    return prisma.bot.update({
      where: { id },
      data: updateBotDto,
    });
  }

  async remove(id: number) {
    return prisma.bot.delete({ where: { id } });
  }

  async start(id: number) {
    return prisma.bot.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
  }

  async stop(id: number) {
    return prisma.bot.update({
      where: { id },
      data: { status: 'STOPPED' },
    });
  }
}

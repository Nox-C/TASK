import { Body, Controller, Get, Param, Post, Patch, Query } from '@nestjs/common';
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';

@Controller('bots')
export class BotsController {
  constructor(private readonly bots: BotsService) {}

  @Post()
  async create(@Body() dto: CreateBotDto, @Query('ownerId') ownerId?: string) {
    // In a real app we'd derive ownerId from auth token; for MVP ownerId may be passed or defaulted
    const owner = ownerId || null;
    const bot = await this.bots.create(dto, owner as any);
    return bot;
  }

  @Get()
  async list(@Query('ownerId') ownerId?: string) {
    return this.bots.findAll(ownerId as any);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.bots.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBotDto) {
    return this.bots.update(id, dto);
  }

  @Post(':id/start')
  async start(@Param('id') id: string, @Query('actorId') actorId?: string) {
    return this.bots.start(id, actorId ?? null);
  }

  @Post(':id/stop')
  async stop(@Param('id') id: string, @Query('actorId') actorId?: string) {
    return this.bots.stop(id, actorId ?? null);
  }
}

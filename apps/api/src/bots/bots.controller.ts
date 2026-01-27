import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';

@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get()
  findAll() {
    return this.botsService.findAll();
  }

  @Get('metrics')
  getMetrics() {
    return this.botsService.getMetrics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.botsService.findOne(+id);
  }

  @Post()
  create(@Body() createBotDto: CreateBotDto) {
    return this.botsService.create(createBotDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBotDto: UpdateBotDto) {
    return this.botsService.update(+id, updateBotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.botsService.remove(+id);
  }

  @Post(':id/start')
  start(@Param('id') id: string) {
    return this.botsService.start(+id);
  }

  @Post(':id/stop')
  stop(@Param('id') id: string) {
    return this.botsService.stop(+id);
  }
}

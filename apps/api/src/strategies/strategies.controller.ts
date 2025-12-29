import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { StrategiesService } from './strategies.service';
import { CreateStrategyDto } from './dto/create-strategy.dto';
import { UpdateStrategyDto } from './dto/update-strategy.dto';

@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategies: StrategiesService) {}

  @Post()
  async create(@Body() dto: CreateStrategyDto) {
    return this.strategies.create(dto);
  }

  @Get()
  async list() {
    return this.strategies.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.strategies.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStrategyDto) {
    return this.strategies.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.strategies.remove(id);
  }
}

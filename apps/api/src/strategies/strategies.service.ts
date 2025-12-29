import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStrategyDto } from './dto/create-strategy.dto';
import { UpdateStrategyDto } from './dto/update-strategy.dto';

@Injectable()
export class StrategiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStrategyDto) {
    return this.prisma.strategy.create({ data: { name: dto.name, description: dto.description, } });
  }

  async findAll() {
    return this.prisma.strategy.findMany();
  }

  async findById(id: string) {
    const s = await this.prisma.strategy.findUnique({ where: { id } });
    if (!s) throw new NotFoundException();
    return s;
  }

  async update(id: string, dto: UpdateStrategyDto) {
    await this.findById(id);
    return this.prisma.strategy.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.strategy.delete({ where: { id } });
  }
}

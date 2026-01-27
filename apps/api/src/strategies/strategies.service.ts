import { Injectable } from '@nestjs/common';
import { prisma } from '@task/database';

@Injectable()
export class StrategiesService {
  async findAll() {
    return prisma.strategy.findMany();
  }
}

import { Module } from '@nestjs/common';
import { MarketReplayController } from './replay.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketModule } from './market.module';

@Module({
  imports: [PrismaModule, MarketModule],
  controllers: [MarketReplayController],
})
export class MarketReplayModule {}

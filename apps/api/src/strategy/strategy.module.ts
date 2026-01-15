import { Module } from '@nestjs/common';
import { MarketModule } from '../market/market.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';

@Module({
  imports: [PrismaModule, MarketModule],
  controllers: [StrategyController],
  providers: [StrategyService],
  exports: [StrategyService],
})
export class StrategyModule {}

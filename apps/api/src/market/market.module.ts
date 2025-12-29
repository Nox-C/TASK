import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { TicksController } from './ticks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketEventsService } from './events.service';

@Module({
  imports: [PrismaModule],
  providers: [MarketService, MarketEventsService],
  controllers: [TicksController],
  exports: [MarketService, MarketEventsService],
})
export class MarketModule {}

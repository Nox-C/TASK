import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { TicksController } from './ticks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketEventsService } from './events.service';
import { ExchangeService } from './exchange.service';

@Module({
  imports: [PrismaModule],
  providers: [MarketService, MarketEventsService, ExchangeService],
  controllers: [TicksController],
  exports: [MarketService, MarketEventsService, ExchangeService],
})
export class MarketModule {}

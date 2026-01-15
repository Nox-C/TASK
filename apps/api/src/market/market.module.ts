import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MarketEventsService } from "./events.service";
import { ExchangeController } from "./exchange.controller";
import { ExchangeService } from "./exchange.service";
import { MarketService } from "./market.service";
import { TicksController } from "./ticks.controller";

@Module({
  imports: [PrismaModule],
  providers: [MarketService, MarketEventsService, ExchangeService],
  controllers: [TicksController, ExchangeController],
  exports: [MarketService, MarketEventsService, ExchangeService],
})
export class MarketModule {}

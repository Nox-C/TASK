import { Module } from "@nestjs/common";
import { MarketEventsService } from "../market/events.service";
import { WsGateway } from "./ws.gateway";

@Module({
  providers: [WsGateway, MarketEventsService],
  exports: [WsGateway],
})
export class WsModule {}

import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from 'socket.io';
import { MarketEventsService } from "../market/events.service";

@WebSocketGateway({
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
})
export class WsGateway implements OnGatewayInit {
  static instance: WsGateway | null = null;
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(WsGateway.name);

  constructor(private readonly marketEvents: MarketEventsService) {}

  afterInit() {
    WsGateway.instance = this;
    this.logger.log("WebSocket gateway initialized");

    // Subscribe to market events and broadcast to clients
    this.marketEvents.onTick((tick) => {
      const priceData = {
        symbol: tick.symbol,
        price: Number(tick.price),
        timestamp: tick.ts ? new Date(tick.ts).getTime() : Date.now(),
      };
      
      // Emit market price updates
      this.server.emit("market.price", priceData);
      
      // Also emit as market_event for the frontend activity feed
      this.server.emit("market_event", {
        type: 'market',
        message: `${tick.symbol}: $${Number(tick.price).toLocaleString()}`,
        payload: priceData,
        ts: priceData.timestamp
      });
    });
  }

  @SubscribeMessage("ping")
  handlePing(client: any, payload: any) {
    client.emit("pong", payload);
  }
}

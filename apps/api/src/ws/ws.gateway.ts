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
      this.server.emit("market.price", {
        symbol: tick.symbol,
        price: Number(tick.price),
        timestamp: tick.ts ? new Date(tick.ts).getTime() : Date.now(),
      });
    });
  }

  @SubscribeMessage("ping")
  handlePing(client: any, payload: any) {
    client.emit("pong", payload);
  }
}

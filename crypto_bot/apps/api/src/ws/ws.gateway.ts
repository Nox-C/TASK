import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WsGateway implements OnGatewayInit {
  static instance: WsGateway | null = null;
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(WsGateway.name);

  afterInit() {
    WsGateway.instance = this;
    this.logger.log('WebSocket gateway initialized');
    // emit sample events periodically (placeholder)
    setInterval(() => {
      this.server.emit('market.price', { symbol: 'BTC-USD', price: Math.random() * 50000 + 10000, ts: Date.now() });
    }, 2000);

    setInterval(() => {
      this.server.emit('bot.status', { botId: 'demo-bot', status: Math.random() > 0.5 ? 'running' : 'stopped', ts: Date.now() });
    }, 5000);
  }

  @SubscribeMessage('ping')
  handlePing(client: any, payload: any) {
    client.emit('pong', payload);
  }
}

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MarketEventsService } from './events.service';
import WebSocket from 'ws';

interface ExchangeConfig {
  name: string;
  wsUrl: string;
  symbols: string[];
  formatMessage: (symbol: string) => any;
  parseMessage: (data: any) => { symbol: string; price: number; timestamp?: number } | null;
}

@Injectable()
export class ExchangeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExchangeService.name);
  private connections: Map<string, WebSocket> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Default symbols to track
  private readonly defaultSymbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD', 'DOT-USD'];

  private readonly exchanges: ExchangeConfig[] = [
    {
      name: 'binance',
      wsUrl: 'wss://stream.binance.com:9443/ws',
      symbols: this.defaultSymbols,
      formatMessage: (symbol: string) => ({
        method: 'SUBSCRIBE',
        params: [`${this.mapToBinance(symbol).toLowerCase()}@ticker`],
        id: Date.now()
      }),
      parseMessage: (data: any) => {
        if (data.e === '24hrTicker' && data.s && data.c) {
          return {
            symbol: this.mapFromBinance(data.s),
            price: parseFloat(data.c),
            timestamp: data.E
          };
        }
        return null;
      }
    },
    {
      name: 'coinbase',
      wsUrl: 'wss://ws-feed.exchange.coinbase.com',
      symbols: this.defaultSymbols,
      formatMessage: (symbol: string) => ({
        type: 'subscribe',
        product_ids: [this.mapToCoinbase(symbol)],
        channels: ['ticker']
      }),
      parseMessage: (data: any) => {
        if (data.type === 'ticker' && data.product_id && data.price) {
          return {
            symbol: this.mapFromCoinbase(data.product_id),
            price: parseFloat(data.price),
            timestamp: new Date(data.time).getTime()
          };
        }
        return null;
      }
    }
  ];

  constructor(private readonly marketEvents: MarketEventsService) {}

  async onModuleInit() {
    this.logger.log('Initializing exchange connections...');
    
    // Start with Binance first as it's more reliable
    await this.connectToExchange(this.exchanges[0]);
    
    // Add delay before connecting to Coinbase to avoid overwhelming
    setTimeout(() => {
      this.connectToExchange(this.exchanges[1]);
    }, 2000);
  }

  async onModuleDestroy() {
    this.logger.log('Closing exchange connections...');
    
    // Clear all reconnect timeouts
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts.clear();
    
    // Close all WebSocket connections
    this.connections.forEach((ws, name) => {
      ws.close();
    });
    this.connections.clear();
  }

  private async connectToExchange(exchange: ExchangeConfig) {
    const { name, wsUrl, symbols, formatMessage, parseMessage } = exchange;
    
    try {
      this.logger.log(`Connecting to ${name} exchange...`);
      
      const ws = new WebSocket(wsUrl);
      this.connections.set(name, ws);

      ws.on('open', () => {
        this.logger.log(`Connected to ${name} exchange`);
        
        // Subscribe to symbols
        symbols.forEach(symbol => {
          const message = formatMessage(symbol);
          ws.send(JSON.stringify(message));
          this.logger.debug(`Subscribed to ${symbol} on ${name}`);
        });
      });

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const parsed = JSON.parse(data.toString());
          const tick = parseMessage(parsed);
          
          if (tick) {
            // Emit the tick through our market events service
            this.marketEvents.emitTick({
              symbol: tick.symbol,
              price: tick.price,
              ts: tick.timestamp ? new Date(tick.timestamp) : new Date()
            });
            
            this.logger.debug(`${name}: ${tick.symbol} = $${tick.price}`);
          }
        } catch (error) {
          this.logger.error(`Error parsing ${name} message:`, error);
        }
      });

      ws.on('error', (error) => {
        this.logger.error(`${name} WebSocket error:`, error);
      });

      ws.on('close', (code, reason) => {
        this.logger.warn(`${name} connection closed: ${code} ${reason}`);
        this.connections.delete(name);
        
        // Schedule reconnection
        this.scheduleReconnect(exchange);
      });

    } catch (error) {
      this.logger.error(`Failed to connect to ${name}:`, error);
      this.scheduleReconnect(exchange);
    }
  }

  private scheduleReconnect(exchange: ExchangeConfig) {
    const timeout = setTimeout(() => {
      this.logger.log(`Attempting to reconnect to ${exchange.name}...`);
      this.connectToExchange(exchange);
    }, 5000); // Reconnect after 5 seconds
    
    this.reconnectTimeouts.set(exchange.name, timeout);
  }

  // Symbol mapping utilities
  private mapToBinance(symbol: string): string {
    // Convert BTC-USD to BTCUSDT
    return symbol.replace('-', '').replace('USD', 'USDT').toUpperCase();
  }

  private mapFromBinance(symbol: string): string {
    // Convert BTCUSDT to BTC-USD
    const base = symbol.replace('USDT', '');
    return `${base}-USD`;
  }

  private mapToCoinbase(symbol: string): string {
    // BTC-USD stays as BTC-USD for Coinbase
    return symbol.toUpperCase();
  }

  private mapFromCoinbase(symbol: string): string {
    // BTC-USD stays as BTC-USD
    return symbol;
  }

  // Public methods for manual control
  public getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.exchanges.forEach(exchange => {
      const ws = this.connections.get(exchange.name);
      status[exchange.name] = ws?.readyState === WebSocket.OPEN;
    });
    return status;
  }

  public async reconnectExchange(exchangeName: string) {
    const exchange = this.exchanges.find(e => e.name === exchangeName);
    if (exchange) {
      // Close existing connection if any
      const existingWs = this.connections.get(exchangeName);
      if (existingWs) {
        existingWs.close();
      }
      
      // Clear any pending reconnect
      const timeout = this.reconnectTimeouts.get(exchangeName);
      if (timeout) {
        clearTimeout(timeout);
        this.reconnectTimeouts.delete(exchangeName);
      }
      
      // Reconnect
      await this.connectToExchange(exchange);
    }
  }
}

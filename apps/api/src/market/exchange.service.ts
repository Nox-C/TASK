import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import WebSocket from "ws";
import { MarketEventsService } from "./events.service";

interface ExchangeConfig {
  name: string;
  wsUrl: string;
  symbols: string[];
  formatMessage: (symbol: string) => any;
  parseMessage: (
    data: any
  ) => { symbol: string; price: number; timestamp?: number } | null;
}

@Injectable()
export class ExchangeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExchangeService.name);
  private connections: Map<string, WebSocket> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Default symbols to track - comprehensive crypto token list
  private readonly defaultSymbols = [
    // Major Cryptocurrencies
    "BTC-USDT",
    "ETH-USDT",
    "BNB-USDT",
    "SOL-USDT",
    "ADA-USDT",
    "DOT-USDT",

    // DeFi Tokens
    "UNI-USDT",
    "AAVE-USDT",
    "LINK-USDT",
    "COMP-USDT",
    "MKR-USDT",
    "SNX-USDT",
    "CRV-USDT",
    "SUSHI-USDT",
    "YFI-USDT",
    "1INCH-USDT",
    "BAL-USDT",

    // Layer 2 & Scaling
    "MATIC-USDT",
    "ARB-USDT",
    "OP-USDT",
    "LDO-USDT",
    "FTM-USDT",

    // Gaming & Metaverse
    "AXS-USDT",
    "SAND-USDT",
    "MANA-USDT",
    "GALA-USDT",
    "ENJ-USDT",

    // Meme Coins
    "DOGE-USDT",
    "SHIB-USDT",
    "PEPE-USDT",
    "FLOKI-USDT",

    // Privacy & Security
    "XMR-USDT",
    "ZEC-USDT",
    "DASH-USDT",

    // Payment & Utility
    "LTC-USDT",
    "BCH-USDT",
    "XRP-USDT",
    "XLM-USDT",
    "EOS-USDT",

    // Storage & Computing
    "FIL-USDT",
    "AR-USDT",
    "RNDR-USDT",
    "AKRO-USDT",

    // Oracle & Data
    "BAND-USDT",
    "TRB-USDT",
    "API3-USDT",

    // Yield & Staking
    "CAKE-USDT",
    "ALPHA-USDT",
    "TOMB-USDT",
    "SPELL-USDT",

    // Cross-chain
    "AVAX-USDT",
    "NEAR-USDT",
    "ATOM-USDT",
    "LUNA-USDT",
    "KSM-USDT",

    // NFT & Digital Collectibles
    "APE-USDT",
    "LOOKS-USDT",
    "BLUR-USDT",

    // AI & Machine Learning
    "FET-USDT",
    "OCEAN-USDT",
    "AGIX-USDT",
    "RNDR-USDT",

    // Stablecoins (for reference)
    "USDT-USDT",
    "USDC-USDT",
    "DAI-USDT",
    "BUSD-USDT",
    "TUSD-USDT",

    // Exchange Tokens
    "LEO-USDT",
    "CRO-USDT",
    "KCS-USDT",
    "HT-USDT",
  ];

  // Rate limiting: track last connection attempts
  private readonly connectionAttempts = new Map<string, number>();
  private readonly lastConnectionTime = new Map<string, number>();
  private readonly RATE_LIMIT_MS = 60000; // 1 minute between reconnections
  private readonly MAX_RETRY_ATTEMPTS = 3;

  private readonly exchanges: ExchangeConfig[] = [
    {
      name: "binance",
      wsUrl: "wss://stream.binance.com:9443/ws",
      symbols: this.defaultSymbols,
      formatMessage: (symbol: string) => ({
        method: "SUBSCRIBE",
        params: [`${this.mapToBinance(symbol).toLowerCase()}@ticker`],
        id: Date.now(),
      }),
      parseMessage: (data: any) => {
        if (data.e === "24hrTicker" && data.s && data.c) {
          return {
            symbol: this.mapFromBinance(data.s),
            price: parseFloat(data.c),
            timestamp: data.E,
          };
        }
        return null;
      },
    },
    {
      name: "coinbase",
      wsUrl: "wss://ws-feed.exchange.coinbase.com",
      symbols: this.defaultSymbols,
      formatMessage: (symbol: string) => ({
        type: "subscribe",
        product_ids: [this.mapToCoinbase(symbol)],
        channels: ["ticker"],
      }),
      parseMessage: (data: any) => {
        if (data.type === "ticker" && data.product_id && data.price) {
          return {
            symbol: this.mapFromCoinbase(data.product_id),
            price: parseFloat(data.price),
            timestamp: new Date(data.time).getTime(),
          };
        }
        return null;
      },
    },
    {
      name: "crypto.com",
      wsUrl: "wss://stream.crypto.com/v2/market",
      symbols: this.defaultSymbols,
      formatMessage: (symbol: string) => ({
        id: Date.now(),
        method: "subscribe",
        params: {
          channels: [`ticker.${this.mapToCryptoCom(symbol).toLowerCase()}`],
        },
      }),
      parseMessage: (data: any) => {
        if (data.method === "ticker" && data.result && data.result.data) {
          const ticker = data.result.data;
          return {
            symbol: this.mapFromCryptoCom(ticker.i),
            price: parseFloat(ticker.a), // 'a' is the best ask price
            timestamp: parseInt(ticker.t) * 1000, // Convert to milliseconds
          };
        }
        return null;
      },
    },
  ];

  constructor(private readonly marketEvents: MarketEventsService) {}

  async onModuleInit() {
    this.logger.log("Initializing exchange connections...");

    // Initialize rate limiting
    this.defaultSymbols.forEach((symbol) => {
      this.connectionAttempts.set(symbol, 0);
      this.lastConnectionTime.set(symbol, 0);
    });

    // Start with Binance first as it's more reliable
    await this.connectToExchange(this.exchanges[0]);

    // Add delay before connecting to Coinbase to avoid overwhelming
    setTimeout(() => {
      this.connectToExchange(this.exchanges[1]);
    }, 2000);

    // Add delay before connecting to Crypto.com
    setTimeout(() => {
      this.connectToExchange(this.exchanges[2]);
    }, 4000);
  }

  async onModuleDestroy() {
    this.logger.log("Closing exchange connections...");

    // Clear all reconnect timeouts
    this.reconnectTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.reconnectTimeouts.clear();

    // Close all WebSocket connections
    this.connections.forEach((ws, name) => {
      ws.close();
    });
    this.connections.clear();
  }

  private async connectToExchange(exchange: ExchangeConfig) {
    const { name, wsUrl, symbols, formatMessage, parseMessage } = exchange;

    // Rate limiting: check if we can connect
    const now = Date.now();
    const canConnect = symbols.every((symbol) => {
      const attempts = this.connectionAttempts.get(symbol) || 0;
      const lastAttempt = this.lastConnectionTime.get(symbol) || 0;

      if (attempts >= this.MAX_RETRY_ATTEMPTS) {
        this.logger.warn(
          `${name}: Max retry attempts reached for ${symbol}, skipping`
        );
        return false;
      }

      if (now - lastAttempt < this.RATE_LIMIT_MS) {
        this.logger.warn(
          `${name}: Rate limiting ${symbol}, waiting ${
            this.RATE_LIMIT_MS - (now - lastAttempt)
          }ms`
        );
        return false;
      }

      return true;
    });

    if (!canConnect) {
      return;
    }

    try {
      this.logger.log(`Connecting to ${name} exchange...`);

      const ws = new WebSocket(wsUrl);
      this.connections.set(name, ws);

      ws.on("open", () => {
        this.logger.log(`Connected to ${name} exchange`);

        // Reset rate limiting on successful connection
        symbols.forEach((symbol) => {
          this.connectionAttempts.set(symbol, 0);
          this.lastConnectionTime.set(symbol, Date.now());
        });

        // Subscribe to symbols
        symbols.forEach((symbol) => {
          const message = formatMessage(symbol);
          ws.send(JSON.stringify(message));
          this.logger.debug(`Subscribed to ${symbol} on ${name}`);
        });
      });

      ws.on("message", (data: WebSocket.Data) => {
        try {
          const parsed = JSON.parse(data.toString());
          const tick = parseMessage(parsed);

          if (tick) {
            // Emit the tick through our market events service
            this.marketEvents.emitTick({
              symbol: tick.symbol,
              price: tick.price,
              ts: tick.timestamp ? new Date(tick.timestamp) : new Date(),
            });

            this.logger.debug(`${name}: ${tick.symbol} = $${tick.price}`);
          }
        } catch (error) {
          this.logger.error(`Error parsing ${name} message:`, error);
        }
      });

      ws.on("error", (error) => {
        this.logger.error(`${name} WebSocket error:`, error);
      });

      ws.on("close", (code, reason) => {
        this.logger.warn(`${name} connection closed: ${code} ${reason}`);
        this.connections.delete(name);

        // Update rate limiting on connection close
        symbols.forEach((symbol) => {
          const attempts = this.connectionAttempts.get(symbol) || 0;
          this.connectionAttempts.set(symbol, attempts + 1);
        });

        // Schedule reconnection with rate limiting
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
    // Convert BTC-USDT to BTCUSDT (already in correct format)
    return symbol.replace("-", "").toUpperCase();
  }

  private mapFromBinance(symbol: string): string {
    // Convert BTCUSDT to BTC-USDT
    if (symbol.endsWith("USDT")) {
      const base = symbol.replace("USDT", "");
      return `${base}-USDT`;
    }
    return symbol;
  }

  private mapToCoinbase(symbol: string): string {
    // Convert BTC-USDT to BTC-USD for Coinbase (Coinbase uses USD pairs)
    return symbol.replace("USDT", "USD").toUpperCase();
  }

  private mapFromCoinbase(symbol: string): string {
    // Convert BTC-USD to BTC-USDT
    return symbol.replace("USD", "USDT");
  }

  // Public methods for manual control
  public getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.exchanges.forEach((exchange) => {
      const ws = this.connections.get(exchange.name);
      status[exchange.name] = ws?.readyState === WebSocket.OPEN;
    });
    return status;
  }

  public async reconnectExchange(exchangeName: string) {
    const exchange = this.exchanges.find((e) => e.name === exchangeName);
    if (exchange) {
      // Reset rate limiting for manual reconnection
      exchange.symbols.forEach((symbol) => {
        this.connectionAttempts.set(symbol, 0);
        this.lastConnectionTime.set(symbol, 0);
      });

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

  public resetRateLimits(): void {
    this.logger.log("Resetting rate limits for all exchanges");
    this.defaultSymbols.forEach((symbol) => {
      this.connectionAttempts.set(symbol, 0);
      this.lastConnectionTime.set(symbol, 0);
    });
  }

  // Crypto.com symbol mapping
  private mapToCryptoCom(symbol: string): string {
    // Convert BTC-USD to BTC_USDT
    return symbol.replace("-", "_").replace("USD", "USDT").toUpperCase();
  }

  private mapFromCryptoCom(symbol: string): string {
    // Convert BTC_USDT to BTC-USD
    const base = symbol.replace("_USDT", "");
    return `${base}-USD`;
  }
}

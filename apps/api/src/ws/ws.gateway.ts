import { Logger } from "@nestjs/common";
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import WebSocket from "ws";
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
    this.logger.log(
      "WebSocket gateway initialized with real exchange connections"
    );

    // Connect to real exchanges
    this.connectToExchanges();
  }

  private connectToExchanges() {
    // Connect to Binance WebSocket
    this.connectBinance();

    // Connect to Coinbase WebSocket
    this.connectCoinbase();

    // Connect to Crypto.com WebSocket
    this.connectCryptoCom();
  }

  private connectBinance() {
    const binanceWs = new WebSocket(
      "wss://stream.binance.com:9443/ws/!ticker@arr"
    );

    binanceWs.on("open", () => {
      this.logger.log("Connected to Binance WebSocket");
    });

    binanceWs.on("message", (data) => {
      try {
        const tickers = JSON.parse(data.toString());
        if (Array.isArray(tickers)) {
          tickers.forEach((ticker) => {
            if (ticker.s && ticker.c) {
              const symbol = ticker.s.replace("USDT", "-USDT");
              const priceData = {
                symbol,
                price: parseFloat(ticker.c),
                timestamp: Date.now(),
                volume: parseFloat(ticker.v || "0"),
                change: parseFloat(ticker.P || "0"),
                high24h: parseFloat(ticker.h || "0"),
                low24h: parseFloat(ticker.l || "0"),
              };

              this.server.emit("market_price", priceData);
              this.server.emit("market_event", {
                type: "market",
                message: `${symbol}: $${priceData.price.toLocaleString()}`,
                payload: priceData,
                ts: priceData.timestamp,
              });

              this.server.emit("chart_data", {
                symbol,
                data: {
                  time: priceData.timestamp,
                  open: priceData.price,
                  high: priceData.high24h,
                  low: priceData.low24h,
                  close: priceData.price,
                  volume: priceData.volume,
                },
              });
            }
          });
        }
      } catch (error) {
        this.logger.error("Binance WebSocket error:", error);
      }
    });

    binanceWs.on("error", (error) => {
      this.logger.error("Binance WebSocket connection error:", error);
      setTimeout(() => this.connectBinance(), 5000);
    });

    binanceWs.on("close", () => {
      this.logger.log("Binance WebSocket closed, reconnecting...");
      setTimeout(() => this.connectBinance(), 5000);
    });
  }

  private connectCoinbase() {
    const coinbaseWs = new WebSocket("wss://ws-feed.exchange.coinbase.com");

    coinbaseWs.on("open", () => {
      this.logger.log("Connected to Coinbase WebSocket");

      const subscribe = {
        type: "subscribe",
        product_ids: [
          "BTC-USD",
          "ETH-USD",
          "BNB-USD",
          "SOL-USD",
          "ADA-USD",
          "XRP-USD",
          "DOT-USD",
          "DOGE-USD",
          "AVAX-USD",
          "MATIC-USD",
          "LINK-USD",
          "UNI-USD",
          "LTC-USD",
          "BCH-USD",
          "ATOM-USD",
          "SHIB-USD",
          "PEPE-USD",
          "ARB-USD",
          "OP-USD",
          "AAVE-USD",
          "MKR-USD",
          "COMP-USD",
          "YFI-USD",
          "SNX-USD",
          "CRV-USD",
        ],
        channels: ["ticker"],
      };
      coinbaseWs.send(JSON.stringify(subscribe));
    });

    coinbaseWs.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "ticker" && message.product_id) {
          const symbol = message.product_id;
          const priceData = {
            symbol,
            price: parseFloat(message.price || "0"),
            timestamp: Date.now(),
            volume: parseFloat(message.volume_24h || "0"),
            change: parseFloat(message.change_24h || "0"),
            high24h: parseFloat(message.high_24h || "0"),
            low24h: parseFloat(message.low_24h || "0"),
          };

          this.server.emit("market_price", priceData);
          this.server.emit("market_event", {
            type: "market",
            message: `${symbol}: $${priceData.price.toLocaleString()}`,
            payload: priceData,
            ts: priceData.timestamp,
          });

          this.server.emit("chart_data", {
            symbol,
            data: {
              time: priceData.timestamp,
              open: priceData.price,
              high: priceData.high24h,
              low: priceData.low24h,
              close: priceData.price,
              volume: priceData.volume,
            },
          });
        }
      } catch (error) {
        this.logger.error("Coinbase WebSocket error:", error);
      }
    });

    coinbaseWs.on("error", (error) => {
      this.logger.error("Coinbase WebSocket connection error:", error);
      setTimeout(() => this.connectCoinbase(), 5000);
    });

    coinbaseWs.on("close", () => {
      this.logger.log("Coinbase WebSocket closed, reconnecting...");
      setTimeout(() => this.connectCoinbase(), 5000);
    });
  }

  private connectCryptoCom() {
    const cryptoComWs = new WebSocket("wss://stream.crypto.com/v2/market");

    cryptoComWs.on("open", () => {
      this.logger.log("Connected to Crypto.com WebSocket");

      const subscribe = {
        method: "subscribe",
        params: {
          channels: ["ticker"],
          instruments: [
            "BTCUSDT",
            "ETHUSDT",
            "BNBUSDT",
            "SOLUSDT",
            "ADAUSDT",
            "XRPUSDT",
            "DOTUSDT",
            "DOGEUSDT",
            "AVAXUSDT",
            "MATICUSDT",
            "LINKUSDT",
            "UNIUSDT",
            "LTCUSDT",
            "BCHUSDT",
            "ATOMUSDT",
            "SHIBUSDT",
            "PEPEUSDT",
            "ARBUSDT",
            "OPUSDT",
            "AAVEUSDT",
            "MKRUSDT",
            "COMPUSDT",
            "YFIUSDT",
            "SNXUSDT",
            "CRVUSDT",
          ],
        },
      };
      cryptoComWs.send(JSON.stringify(subscribe));
    });

    cryptoComWs.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (
          message.method === "ticker" &&
          message.result &&
          message.result.data
        ) {
          const ticker = message.result.data;
          const symbol = ticker.i.replace("USDT", "-USDT");
          const priceData = {
            symbol,
            price: parseFloat(ticker.a || "0"),
            timestamp: Date.now(),
            volume: parseFloat(ticker.v || "0"),
            change: parseFloat(ticker.c || "0"),
            high24h: parseFloat(ticker.h || "0"),
            low24h: parseFloat(ticker.l || "0"),
          };

          this.server.emit("market_price", priceData);
          this.server.emit("market_event", {
            type: "market",
            message: `${symbol}: $${priceData.price.toLocaleString()}`,
            payload: priceData,
            ts: priceData.timestamp,
          });

          this.server.emit("chart_data", {
            symbol,
            data: {
              time: priceData.timestamp,
              open: priceData.price,
              high: priceData.high24h,
              low: priceData.low24h,
              close: priceData.price,
              volume: priceData.volume,
            },
          });
        }
      } catch (error) {
        this.logger.error("Crypto.com WebSocket error:", error);
      }
    });

    cryptoComWs.on("error", (error) => {
      this.logger.error("Crypto.com WebSocket connection error:", error);
      setTimeout(() => this.connectCryptoCom(), 5000);
    });

    cryptoComWs.on("close", () => {
      this.logger.log("Crypto.com WebSocket closed, reconnecting...");
      setTimeout(() => this.connectCryptoCom(), 5000);
    });
  }

  @SubscribeMessage("ping")
  handlePing(client: any, payload: any) {
    client.emit("pong", payload);
  }
}

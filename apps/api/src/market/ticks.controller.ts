import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { MarketService } from "./market.service";

@Controller("market")
export class TicksController {
  constructor(private readonly market: MarketService) {}

  @Post("ticks")
  async ingest(
    @Body()
    payload: {
      symbol: string;
      price: string | number;
      bid?: string | number;
      ask?: string | number;
      source?: string;
      ts?: string | Date;
    }
  ) {
    return this.market.ingestTick(payload);
  }

  @Get("ticks/:symbol")
  async latestTick(@Param("symbol") symbol: string) {
    return this.market.latestTick(symbol);
  }

  @Get("ohlcv/:symbol")
  async getOHLCV(
    @Param("symbol") symbol: string,
    @Query("timeframe") timeframe?: string,
    @Query("limit") limit?: string
  ) {
    return this.market.getOHLCV(symbol, timeframe || "1m", parseInt(limit || "100"));
  }

  @Post("test/sample-data")
  async generateSampleData() {
    // Generate sample market data for testing
    const symbols = ["BTC-USD", "ETH-USD", "SOL-USD"];
    const results = [];

    for (const symbol of symbols) {
      // Get real price from exchanges instead of fake data
      const realPrice = await this.getRealExchangePrice(symbol);

      const tick = await this.market.ingestTick({
        symbol,
        price: realPrice.toFixed(2),
        source: "live-exchange",
        ts: new Date(),
      });

      results.push(tick);
    }

    return {
      message: "Sample data generated",
      count: results.length,
      data: results,
    };
  }

  private async getRealExchangePrice(symbol: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/' + symbol.toLowerCase().replace('-', '') + '@ticker');
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve(0); // Fallback price
      }, 5000);

      ws.onmessage = (data) => {
        try {
          const ticker = JSON.parse(data.toString());
          if (ticker.c) {
            clearTimeout(timeout);
            ws.close();
            resolve(parseFloat(ticker.c));
          }
        } catch (error) {
          clearTimeout(timeout);
          ws.close();
          resolve(0);
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve(0); // Fallback price
      };

      ws.onclose = () => {
        clearTimeout(timeout);
      };
    });
  }
}

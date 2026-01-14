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
      const basePrice =
        symbol === "BTC-USD" ? 45000 : symbol === "ETH-USD" ? 3200 : 120;
      const variation = (Math.random() - 0.5) * basePrice * 0.02; // ±1% variation
      const price = basePrice + variation;

      const tick = await this.market.ingestTick({
        symbol,
        price: price.toFixed(2),
        source: "test-generator",
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
}

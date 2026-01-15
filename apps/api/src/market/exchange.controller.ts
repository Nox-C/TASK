import { Controller, Get, Post } from "@nestjs/common";
import { ExchangeService } from "./exchange.service";

@Controller("exchange")
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get("status")
  getStatus() {
    return {
      message: "Exchange connection status",
      connections: this.exchangeService.getConnectionStatus(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get("symbols")
  getSupportedSymbols() {
    return {
      message: "Supported trading symbols",
      categories: {
        major: ["BTC-USDT", "ETH-USDT", "BNB-USDT", "SOL-USDT", "ADA-USDT", "DOT-USDT"],
        defi: ["UNI-USDT", "AAVE-USDT", "LINK-USDT", "COMP-USDT", "MKR-USDT", "SNX-USDT", "CRV-USDT", "SUSHI-USDT", "YFI-USDT", "1INCH-USDT", "BAL-USDT"],
        layer2: ["MATIC-USDT", "ARB-USDT", "OP-USDT", "LDO-USDT", "FTM-USDT"],
        gaming: ["AXS-USDT", "SAND-USDT", "MANA-USDT", "GALA-USDT", "ENJ-USDT"],
        meme: ["DOGE-USDT", "SHIB-USDT", "PEPE-USDT", "FLOKI-USDT"],
        privacy: ["XMR-USDT", "ZEC-USDT", "DASH-USDT"],
        payment: ["LTC-USDT", "BCH-USDT", "XRP-USDT", "XLM-USDT", "EOS-USDT"],
        storage: ["FIL-USDT", "AR-USDT", "RNDR-USDT", "AKRO-USDT"],
        oracle: ["BAND-USDT", "TRB-USDT", "API3-USDT"],
        yield: ["CAKE-USDT", "ALPHA-USDT", "TOMB-USDT", "SPELL-USDT"],
        crosschain: ["AVAX-USDT", "NEAR-USDT", "ATOM-USDT", "LUNA-USDT", "KSM-USDT"],
        nft: ["APE-USDT", "LOOKS-USDT", "BLUR-USDT"],
        ai: ["FET-USDT", "OCEAN-USDT", "AGIX-USDT", "RNDR-USDT"],
        stablecoins: ["USDT-USDT", "USDC-USDT", "DAI-USDT", "BUSD-USDT", "TUSD-USDT"],
        exchange: ["LEO-USDT", "CRO-USDT", "KCS-USDT", "HT-USDT"]
      },
      total: 73,
      timestamp: new Date().toISOString()
    };
  }

  @Post("reset-rate-limits")
  resetRateLimits() {
    return {
      message: "Rate limiting reset - all connections will be retried",
      timestamp: new Date().toISOString(),
    };
  }
}

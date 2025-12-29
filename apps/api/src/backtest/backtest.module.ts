import { Module } from "@nestjs/common";
import { MarketModule } from "../market/market.module";
import { OrdersModule } from "../orders/orders.module";
import { BacktestController } from "./backtest.controller";
import { BacktestService } from "./backtest.service";
import { BacktestReportingService } from "./reporting.service";

@Module({
  imports: [MarketModule, OrdersModule],
  providers: [BacktestService, BacktestReportingService],
  controllers: [BacktestController],
  exports: [BacktestService, BacktestReportingService],
})
export class BacktestModule {}

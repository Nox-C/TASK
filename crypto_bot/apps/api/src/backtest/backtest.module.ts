import { Module } from '@nestjs/common';
import { BacktestService } from './backtest.service';
import { BacktestController } from './backtest.controller';
import { MarketModule } from '../market/market.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [MarketModule, OrdersModule],
  providers: [BacktestService, BacktestReportingService],
  controllers: [BacktestController],
})
export class BacktestModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WsGateway } from './ws/ws.gateway';
import { BotsModule } from './bots/bots.module';
import { AuditModule } from './audit/audit.module';
import { StrategiesModule } from './strategies/strategies.module';
import { TasksModule } from './tasks/tasks.module';
import { OrdersModule } from './orders/orders.module';
import { PnlModule } from './pnl/pnl.module';
import { LedgerModule } from './ledger/ledger.module';
import { MarketModule } from './market/market.module';
import { MarketReplayModule } from './market/replay.module';
import { BacktestModule } from './backtest/backtest.module';
import { BacktestReportingService } from './backtest/reporting.service';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, BotsModule, AuditModule, StrategiesModule, TasksModule, OrdersModule, PnlModule, LedgerModule, MarketModule, MarketReplayModule, BacktestModule],
  controllers: [],
  providers: [WsGateway],
})
export class AppModule {}

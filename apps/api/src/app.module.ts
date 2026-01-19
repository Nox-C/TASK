import { Module } from "@nestjs/common";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { BacktestModule } from "./backtest/backtest.module";
import { BotsModule } from "./bots/bots.module";
import { LedgerModule } from "./ledger/ledger.module";
import { MarketEventsService } from "./market/events.service";
import { MarketModule } from "./market/market.module";
import { MarketReplayModule } from "./market/replay.module";
import { OrdersModule } from "./orders/orders.module";
import { PnlModule } from "./pnl/pnl.module";
import { PrismaModule } from "./prisma/prisma.module";
import { StrategyModule } from "./strategy/strategy.module";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";
import { WsGateway } from "./ws/ws.gateway";
import { WsModule } from "./ws/ws.module";

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    BotsModule,
    AuditModule,
    StrategyModule,
    TasksModule,
    OrdersModule,
    PnlModule,
    LedgerModule,
    MarketModule,
    MarketReplayModule,
    BacktestModule,
    WsModule,
  ],
  controllers: [],
  providers: [WsGateway, MarketEventsService],
})
export class AppModule {}

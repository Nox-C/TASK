import { Module } from '@nestjs/common';
import { BotsModule } from './bots/bots.module';
import { StrategiesModule } from './strategies/strategies.module';

@Module({
  imports: [BotsModule, StrategiesModule],
})
export class AppModule {}

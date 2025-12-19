import { Module } from '@nestjs/common';
import { PnlService } from './pnl.service';
import { PnlController } from './pnl.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PnlService],
  controllers: [PnlController],
  exports: [PnlService],
})
export class PnlModule {}

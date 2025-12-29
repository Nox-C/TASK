import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PnlController } from "./pnl.controller";
import { PnlService } from "./pnl.service";
import { RealizedService } from "./realized.service";

@Module({
  imports: [PrismaModule],
  providers: [PnlService, RealizedService],
  controllers: [PnlController],
  exports: [PnlService],
})
export class PnlModule {}

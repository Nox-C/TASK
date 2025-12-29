import { Module } from '@nestjs/common';
import { AuditModule } from "../audit/audit.module";
import { BotsModule } from "../bots/bots.module";
import { PrismaModule } from '../prisma/prisma.module';
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [PrismaModule, AuditModule, BotsModule],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}

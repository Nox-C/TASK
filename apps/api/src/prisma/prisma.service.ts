import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../../generated/prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL || 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19tbUZkX1I5MlgzcmRCSDhQV3IyS3QiLCJhcGlfa2V5IjoiMDFLRE1QNUIyS002QjFYQzYxQURYRlpYSEIiLCJ0ZW5hbnRfaWQiOiI3YTA2ZTNiYmI1ODk5NjE1MDVlNjJhNTJiNjBlZjc4OTI0YWRhYzVhZWVhZDgwYWUyNTEwNTAyMTljZTEwMTljIiwiaW50ZXJuYWxfc2VjcmV0IjoiODJkOGM3MzUtMWI4NC00ZjY5LWI0ZjAtMDQyYjJiNmUzNWEyIn0.TviZgN8tM01yAuyNu6SKheVRM2ovf9JI0dqVCaZoajM',
  }).$extends(withAccelerate());

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Delegate all Prisma methods
  get user() { return this.prisma.user; }
  get bot() { return this.prisma.bot; }
  get strategy() { return this.prisma.strategy; }
  get order() { return this.prisma.order; }
  get fill() { return this.prisma.fill; }
  get account() { return this.prisma.account; }
  get balance() { return this.prisma.balance; }
  get position() { return this.prisma.position; }
  get task() { return this.prisma.task; }
  get taskRun() { return this.prisma.taskRun; }
  get taskTrigger() { return this.prisma.taskTrigger; }
  get taskAction() { return this.prisma.taskAction; }
  get session() { return this.prisma.session; }
  get botRun() { return this.prisma.botRun; }
  get ledgerEntry() { return this.prisma.ledgerEntry; }
  get pnlSnapshot() { return this.prisma.pnlSnapshot; }
  get priceTick() { return this.prisma.priceTick; }
  get backtestRun() { return this.prisma.backtestRun; }
  get auditEvent() { return this.prisma.auditEvent; }
}

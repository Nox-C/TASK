import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(actorId: string | null, actorType: string | null, action: string, details?: any) {
    return this.prisma.auditEvent.create({
      data: {
        actorId,
        actorType,
        action,
        details,
      },
    });
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async create(dto: CreateTaskDto, ownerId?: string) {
    // Ensure we have an ownerId - if not provided, we can't create the task
    const finalOwnerId = ownerId ?? dto.ownerId;
    if (!finalOwnerId) {
      throw new Error("ownerId is required to create a task");
    }

    const task = await this.prisma.task.create({
      data: {
        name: dto.name,
        ownerId: finalOwnerId,
        // create triggers & actions
        triggers: {
          create: dto.triggers.map((t) => ({
            type: t.type,
            config: t.config || {},
          })),
        },
        actions: {
          create: dto.actions.map((a) => ({
            type: a.type,
            config: a.config || {},
          })),
        },
      },
      include: { triggers: true, actions: true },
    });

    await this.audit.record(
      ownerId ?? null,
      ownerId ? "user" : "system",
      "task.create",
      { taskId: task.id }
    );

    return task;
  }

  async findAll(ownerId?: string) {
    const where = ownerId ? { ownerId } : {};
    return this.prisma.task.findMany({
      where,
      include: { triggers: true, actions: true },
    });
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { triggers: true, actions: true },
    });
    if (!task) throw new NotFoundException();
    return task;
  }

  async runTask(taskId: string, actorId: string | null = null, meta?: any) {
    const task = await this.findById(taskId);

    // create a TaskRun record
    const run = await this.prisma.taskRun.create({
      data: { taskId: task.id, status: "enqueued" },
    });

    // For MVP we don't dispatch to worker here; worker's scheduler will pick cron triggers.
    // But for immediate runs (webhook/manual) we mark enqueued and record audit.

    await this.audit.record(
      actorId,
      actorId ? "user" : "system",
      "task.run.enqueued",
      { taskId: task.id, runId: run.id, meta }
    );

    return { task, run };
  }

  async findRuns(taskId: string, limit: number = 50) {
    return this.prisma.taskRun.findMany({
      where: { taskId },
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        task: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findRecentRuns(limit: number = 50) {
    return this.prisma.taskRun.findMany({
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        task: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async handleWebhook(key: string, payload: any) {
    // Find a webhook trigger matching the key
    const trigger = await this.prisma.taskTrigger.findFirst({
      where: {
        type: "webhook",
        config: {
          path: ["key"],
          equals: key,
        },
      },
      include: { task: true },
    });
    if (!trigger) throw new NotFoundException();
    return this.runTask(trigger.taskId, null, { webhookPayload: payload });
  }
}

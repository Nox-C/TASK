import * as common from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TasksService } from "./tasks.service";

@common.Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @common.Post()
  async create(@common.Body() dto: CreateTaskDto) {
    try {
      return await this.tasks.create(dto);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("ownerId is required")
      ) {
        throw new common.BadRequestException(
          "ownerId is required to create a task"
        );
      }
      throw error;
    }
  }

  @common.Get()
  async list(@common.Query("ownerId") ownerId?: string) {
    return this.tasks.findAll(ownerId as any);
  }

  @common.Get(":id")
  async get(@common.Param("id") id: string) {
    return this.tasks.findById(id);
  }

  @common.Post(":id/run")
  async run(
    @common.Param("id") id: string,
    @common.Query("actorId") actorId?: string
  ) {
    return this.tasks.runTask(id, actorId ?? null);
  }

  // webhook endpoint: /tasks/webhook/:key
  @common.Post("webhook/:key")
  async webhook(@common.Param("key") key: string, @common.Body() body: any) {
    return this.tasks.handleWebhook(key, body);
  }
}

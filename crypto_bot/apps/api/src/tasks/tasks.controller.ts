import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  async create(@Body() dto: CreateTaskDto, @Query('ownerId') ownerId?: string) {
    return this.tasks.create(dto, ownerId as any);
  }

  @Get()
  async list(@Query('ownerId') ownerId?: string) {
    return this.tasks.findAll(ownerId as any);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.tasks.findById(id);
  }

  @Post(':id/run')
  async run(@Param('id') id: string, @Query('actorId') actorId?: string) {
    return this.tasks.runTask(id, actorId ?? null);
  }

  // webhook endpoint: /tasks/webhook/:key
  @Post('webhook/:key')
  async webhook(@Param('key') key: string, @Body() body: any) {
    return this.tasks.handleWebhook(key, body);
  }
}

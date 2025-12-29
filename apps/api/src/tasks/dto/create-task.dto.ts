import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTaskTriggerDto } from './create-task-trigger.dto';
import { CreateTaskActionDto } from './create-task-action.dto';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskTriggerDto)
  triggers!: CreateTaskTriggerDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskActionDto)
  actions!: CreateTaskActionDto[];

  @IsOptional()
  @IsString()
  ownerId?: string;
}

import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTaskTriggerDto {
  @IsString()
  @IsIn(['cron', 'webhook'])
  type!: 'cron' | 'webhook';

  @IsOptional()
  @IsObject()
  config?: any;
}

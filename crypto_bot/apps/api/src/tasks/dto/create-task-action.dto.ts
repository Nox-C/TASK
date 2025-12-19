import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTaskActionDto {
  @IsString()
  @IsIn(['bot.start', 'bot.stop', 'notify'])
  type!: 'bot.start' | 'bot.stop' | 'notify';

  @IsOptional()
  @IsObject()
  config?: any;
}

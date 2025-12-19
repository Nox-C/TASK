import { IsOptional, IsString } from 'class-validator';

export class UpdateBotDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  strategyId?: string;

  @IsOptional()
  active?: boolean;
}

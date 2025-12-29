import { IsOptional, IsString } from 'class-validator';

export class UpdateStrategyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  params?: any;
}

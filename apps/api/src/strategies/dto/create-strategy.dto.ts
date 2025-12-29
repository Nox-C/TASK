import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStrategyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  // JSON schema or parameters can be extended later
  @IsOptional()
  params?: any;
}

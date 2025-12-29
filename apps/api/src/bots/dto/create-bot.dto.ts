import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBotDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  strategyId!: string;

  @IsOptional()
  active?: boolean;
}

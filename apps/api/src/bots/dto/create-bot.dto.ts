import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBotDto {
  @IsString()
  name!: string;

  @IsString()
  strategy!: string;

  @IsString()
  exchange!: string;

  @IsString()
  tradingPair!: string;

  @IsNumber()
  positionSize!: number;

  @IsNumber()
  stopLoss!: number;

  @IsNumber()
  takeProfit!: number;

  @IsOptional()
  @IsString()
  status?: string;
}

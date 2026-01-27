import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { BotStatus } from '@task/database';

export class CreateBotDto {
  @IsString()
  name: string;

  @IsString()
  strategy: string;

  @IsString()
  exchange: string;

  @IsString()
  tradingPair: string;

  @IsNumber()
  positionSize: number;

  @IsNumber()
  stopLoss: number;

  @IsNumber()
  takeProfit: number;

  @IsOptional()
  @IsEnum(BotStatus)
  status?: BotStatus;
}

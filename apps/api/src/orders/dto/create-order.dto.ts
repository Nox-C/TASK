import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  accountId!: string;

  @IsString()
  symbol!: string;

  @IsIn(['buy', 'sell'])
  side!: 'buy' | 'sell';

  @IsNumber()
  qty!: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsIn(['market', 'limit'])
  type?: 'market' | 'limit';
}

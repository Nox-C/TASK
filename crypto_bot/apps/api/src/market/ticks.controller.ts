import { Body, Controller, Post } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class TicksController {
  constructor(private readonly market: MarketService) {}

  @Post('ticks')
  async ingest(@Body() payload: { symbol: string; price: string | number; bid?: string | number; ask?: string | number; source?: string; ts?: string | Date }) {
    return this.market.ingestTick(payload);
  }
}

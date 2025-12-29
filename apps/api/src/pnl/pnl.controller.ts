import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PnlService } from './pnl.service';

@Controller('pnl')
export class PnlController {
  constructor(private readonly pnl: PnlService) {}

  @Post('snapshots')
  async compute(@Query('accountId') accountId?: string) {
    if (accountId) return this.pnl.computeSnapshotForAccount(accountId);
    return this.pnl.computeSnapshotsAll();
  }

  @Get('snapshots')
  async list(@Query('accountId') accountId?: string) {
    return this.pnl.listSnapshots(accountId);
  }
}

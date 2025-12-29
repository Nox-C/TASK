import { Injectable } from '@nestjs/common';
import Decimal from "decimal.js";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async createEntry(params: {
    accountId: string;
    asset: string;
    debit?: string | Decimal | number;
    credit?: string | Decimal | number;
    currency?: string;
    referenceType?: string;
    referenceId?: string;
    meta?: any;
  }) {
    const entry = await this.prisma.ledgerEntry.create({
      data: {
        accountId: params.accountId,
        asset: params.asset,
        debit: params.debit ? new Decimal(params.debit).toFixed(10) : '0',
        credit: params.credit ? new Decimal(params.credit).toFixed(10) : '0',
        currency: params.currency ?? 'USD',
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        meta: params.meta ?? {},
      },
    });

    return entry;
  }

  async recordFillAsLedger(fillId: string) {
    // Load fill with order -> account
    const f = await this.prisma.fill.findUnique({ where: { id: fillId }, include: { order: true } });
    if (!f) throw new Error('fill not found');

    const accountId = f.order.accountId;
    const symbol = f.order.symbol;
    const side = f.order.side as 'buy' | 'sell';
    const qty = new Decimal((f.qty as any).toString());
    const price = new Decimal((f.price as any).toString());
    const notional = qty.mul(price);

    if (side === 'buy') {
      // debit asset, credit cash
      await this.createEntry({ accountId, asset: symbol, debit: qty.toFixed(10), referenceType: 'fill', referenceId: fillId });
      await this.createEntry({ accountId, asset: 'USD', credit: notional.toFixed(10), referenceType: 'fill', referenceId: fillId });
    } else {
      // sell: credit asset, debit cash
      await this.createEntry({ accountId, asset: symbol, credit: qty.toFixed(10), referenceType: 'fill', referenceId: fillId });
      await this.createEntry({ accountId, asset: 'USD', debit: notional.toFixed(10), referenceType: 'fill', referenceId: fillId });
    }

    // fee ledger
    if (
      f.feeAmount &&
      f.feeAmount instanceof Decimal &&
      f.feeAmount.toNumber() !== 0
    ) {
      await this.createEntry({
        accountId,
        asset: f.feeAsset ?? "USD",
        credit: new Decimal((f.feeAmount as any).toString()).toFixed(10),
        referenceType: "fee",
        referenceId: fillId,
      });
    }

    return true;
  }

  async computeBalances(accountId: string) {
    const rows = await this.prisma.ledgerEntry.findMany({ where: { accountId } });
    const { computeBalancesFromRows } = await import('./helpers');
    return computeBalancesFromRows(rows as any);
  }
}

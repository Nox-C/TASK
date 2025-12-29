import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { LedgerService } from "../ledger/ledger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly ledger: LedgerService
  ) {}

  async placeOrder(dto: CreateOrderDto, actorId: string | null = null) {
    // Basic validation: ensure account exists
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException("account not found");

    // Create order record (status pending)
    const order = await this.prisma.order.create({
      data: {
        accountId: dto.accountId,
        symbol: dto.symbol,
        side: dto.side,
        qty: dto.qty,
        price: dto.price ?? 0,
        status: "filled", // for paper trading MVP we immediately fill
      },
    });

    // Simulate immediate fill
    const fill = await this.prisma.fill.create({
      data: {
        orderId: order.id,
        qty: dto.qty,
        price: dto.price ?? (await this.mockMarketPrice(dto.symbol)),
        executedQty: dto.qty,
        executedPrice: dto.price ?? (await this.mockMarketPrice(dto.symbol)),
      },
    });

    // Record ledger entries for the fill (double-entry accounting)
    try {
      await this.ledger.recordFillAsLedger(fill.id);
    } catch (err) {
      // log but do not block; audit the failure
      console.error("[orders] ledger.recordFillAsLedger failed", err);
    }

    // Update positions and balances (very basic)
    await this.applyFillToAccount(
      account.id,
      dto.symbol,
      dto.side,
      fill.executedQty.toNumber(),
      fill.executedPrice.toNumber()
    );

    await this.audit.record(
      actorId,
      actorId ? "user" : "system",
      "order.placed",
      { orderId: order.id, fillId: fill.id }
    );

    return { order, fill };
  }

  async cancelOrder(orderId: string, actorId: string | null = null) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException("order not found");
    if (order.status !== "pending")
      throw new BadRequestException(
        "only pending orders can be canceled in MVP"
      );

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: "canceled" },
    });
    await this.audit.record(
      actorId,
      actorId ? "user" : "system",
      "order.canceled",
      { orderId }
    );
    return updated;
  }

  async list(accountId?: string) {
    const where = accountId ? { accountId } : {};
    return this.prisma.order.findMany({ where, include: { fills: true } });
  }

  private async mockMarketPrice(symbol: string) {
    // simplistic: return random price for demo
    return Math.round((Math.random() * 10000 + 100) * 100) / 100;
  }

  private async applyFillToAccount(
    accountId: string,
    symbol: string,
    side: "buy" | "sell",
    qty: number,
    price: number
  ) {
    // Update balances and positions minimally
    // Update position
    const pos = await this.prisma.position.findFirst({
      where: { accountId, symbol },
    });
    if (!pos) {
      // create new position
      const avgPrice = price;
      const newQty = side === "buy" ? qty : -qty;
      await this.prisma.position.create({
        data: { accountId, symbol, qty: newQty, avgPrice },
      });
    } else {
      // adjust existing
      const newQty = pos.qty + (side === "buy" ? qty : -qty);
      const newAvg =
        side === "buy"
          ? (pos.avgPrice * pos.qty + price * qty) / (pos.qty + qty || 1)
          : pos.avgPrice;
      await this.prisma.position.update({
        where: { id: pos.id },
        data: { qty: newQty, avgPrice: newAvg },
      });
    }

    // Update balances naively (assume base currency USD)
    const baseAsset = "USD";
    const cost = qty * price * (side === "buy" ? -1 : 1);
    const balance = await this.prisma.balance.findFirst({
      where: { accountId, asset: baseAsset },
    });
    if (!balance) {
      await this.prisma.balance.create({
        data: { accountId, asset: baseAsset, amount: cost },
      });
    } else {
      await this.prisma.balance.update({
        where: { id: balance.id },
        data: { amount: balance.amount + cost },
      });
    }
  }
}

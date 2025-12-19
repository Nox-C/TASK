import { MemoryLedger } from './memory-ledger';

export class MemoryOrdersService {
  constructor(private readonly ledger: MemoryLedger) {}

  async placeOrder(order: { accountId?: string; symbol: string; side: 'buy' | 'sell'; qty: number; price?: number }) {
    // For simulation we assume immediate full fill at price provided or market price passed in handler
    const price = order.price ?? 0;
    const qty = order.side === 'buy' ? order.qty : -order.qty;
    const fill = this.ledger.placeFill(order.symbol, qty, price, 0);
    return { orderId: `mem-order-${Date.now()}`, fill };
  }
}

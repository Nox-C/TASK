export class PaperExecutionAdapter {
  constructor(private readonly apiBase: string = process.env.API_BASE || 'http://localhost:3001') {}

  async placeOrder(order: any) {
    // For the adapter we forward to the API orders endpoint
    const res = await fetch(`${this.apiBase}/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.json();
  }

  async cancelOrder(orderId: string) {
    const res = await fetch(`${this.apiBase}/orders/${orderId}/cancel`, { method: 'POST' });
    return res.json();
  }
}

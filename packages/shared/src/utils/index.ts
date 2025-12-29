// Common helpers
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const calculatePnL = (entryPrice: number, currentPrice: number, qty: number, side: 'buy' | 'sell'): number => {
  const priceDiff = currentPrice - entryPrice;
  return side === 'buy' ? priceDiff * qty : -priceDiff * qty;
};

export const generateId = (): string => {
  return crypto.randomUUID();
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
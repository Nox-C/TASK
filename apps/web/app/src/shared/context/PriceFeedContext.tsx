'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { PriceData } from '../types/trading';

interface PriceFeedContextType {
  prices: Record<string, PriceData>;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  getPrice: (symbol: string) => PriceData | undefined;
  isConnected: boolean;
}

const PriceFeedContext = createContext<PriceFeedContextType | undefined>(undefined);

export function PriceFeedProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Simulated WebSocket connection
  useEffect(() => {
    const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT'];
    
    // Initialize prices
    const initialPrices: Record<string, PriceData> = {};
    symbols.forEach(symbol => {
      initialPrices[symbol] = {
        symbol,
        price: Math.random() * 100000 + 1000,
        change24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 1000000000,
        timestamp: Date.now()
      };
    });
    setPrices(initialPrices);
    setIsConnected(true);

    // Simulate live price updates
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(symbol => {
          const currentPrice = updated[symbol].price;
          const change = (Math.random() - 0.5) * currentPrice * 0.001; // 0.1% max change
          updated[symbol] = {
            ...updated[symbol],
            price: currentPrice + change,
            change24h: updated[symbol].change24h + (change / currentPrice) * 100,
            timestamp: Date.now()
          };
        });
        return updated;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const subscribe = (symbol: string) => {
    // In real implementation, would add to WebSocket subscription
    console.log(`Subscribing to ${symbol}`);
  };

  const unsubscribe = (symbol: string) => {
    // In real implementation, would remove from WebSocket subscription
    console.log(`Unsubscribing from ${symbol}`);
  };

  const getPrice = (symbol: string) => {
    return prices[symbol];
  };

  return (
    <PriceFeedContext.Provider value={{
      prices,
      subscribe,
      unsubscribe,
      getPrice,
      isConnected
    }}>
      {children}
    </PriceFeedContext.Provider>
  );
}

export function usePriceFeed() {
  const context = useContext(PriceFeedContext);
  if (!context) {
    throw new Error('usePriceFeed must be used within a PriceFeedProvider');
  }
  return context;
}

'use client';

import React from 'react';
import { usePriceFeed } from '../context/PriceFeedContext';

export function usePrice(symbol: string) {
  const { getPrice, prices, subscribe, unsubscribe, isConnected } = usePriceFeed();
  
  // Auto-subscribe to symbol when hook is used
  React.useEffect(() => {
    if (symbol && isConnected) {
      subscribe(symbol);
      return () => unsubscribe(symbol);
    }
  }, [symbol, isConnected, subscribe, unsubscribe]);

  return getPrice(symbol);
}

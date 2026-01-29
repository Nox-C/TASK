'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { PriceData } from '../types/trading';

export const usePriceFeed = (symbol: string) => {
  const setPrice = useTradeStore((state) => state.setPrice);
  const setGlobalError = useTradeStore((state) => state.setGlobalError);
  const [isError, setIsError] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current) socketRef.current.close();
    
    // Use environment variable for WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'wss://stream.binance.com:9443/ws';
    socketRef.current = new WebSocket(`${wsUrl}/${symbol.toLowerCase()}@aggTrade`);
    
    socketRef.current.onopen = () => {
      setIsError(false);
      setGlobalError(false);
    };
    
    socketRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // Binance aggTrade format: {e: "aggTrade", E: timestamp, s: symbol, p: price, q: quantity, ...}
        if (data.e === "aggTrade" && data.s && data.p) {
          const priceData: PriceData = {
            symbol: data.s,
            price: parseFloat(data.p),
            change24h: 0, // aggTrade doesn't include 24h change
            volume24h: parseFloat(data.q || '0'),
            timestamp: data.E || Date.now()
          };
          setPrice(symbol, priceData);
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };
    
    socketRef.current.onerror = () => {
      setIsError(true);
      setGlobalError(true);
    };
    
    socketRef.current.onclose = () => {
      setIsError(true);
      setGlobalError(true);
      // Auto-reboot attempt after 10 seconds
      setTimeout(connect, 10000);
    };
  }, [symbol]);

  useEffect(() => { 
    connect(); 
    return () => socketRef.current?.close(); 
  }, [connect]);

  return { isError, reboot: connect };
};

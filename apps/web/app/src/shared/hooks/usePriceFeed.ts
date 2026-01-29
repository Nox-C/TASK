'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { PriceData } from '../types/trading';

export const usePriceFeed = (symbol: string) => {
  const setPrice = useTradeStore((state) => state.setPrice);
  const setGlobalError = useTradeStore((state) => state.setGlobalError);
  const [isError, setIsError] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    // Use environment variable for WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'wss://stream.binance.com:9443/ws';
    const ws = new WebSocket(`${wsUrl}/${symbol.toLowerCase()}@aggTrade`);
    socketRef.current = ws;
    
    ws.onopen = () => {
      setIsError(false);
      setGlobalError(false);
    };
    
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // Binance aggTrade format: {e: "aggTrade", E: timestamp, s: symbol, p: price, q: quantity, ...}
        if (data.e === "aggTrade" && data.s && data.p) {
          // Throttle updates to prevent React death loops (max 10 updates per second)
          const now = Date.now();
          if (now - lastUpdateRef.current < 100) return; // Skip if less than 100ms since last update
          lastUpdateRef.current = now;
          
          const priceData: PriceData = {
            symbol: data.s,
            price: parseFloat(data.p),
            change24h: 0, // aggTrade doesn't include 24h change
            volume24h: parseFloat(data.q || '0'),
            timestamp: data.E || Date.now()
          };
          
          // Use functional update to avoid dependency issues
          setPrice(symbol, priceData);
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };
    
    ws.onerror = () => {
      setIsError(true);
      setGlobalError(true);
    };
    
    ws.onclose = () => {
      setIsError(true);
      setGlobalError(true);
      // Auto-reboot attempt after 10 seconds
      setTimeout(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'wss://stream.binance.com:9443/ws';
        const newWs = new WebSocket(`${wsUrl}/${symbol.toLowerCase()}@aggTrade`);
        socketRef.current = newWs;
        // Re-attach all event handlers
        newWs.onopen = ws.onopen;
        newWs.onmessage = ws.onmessage;
        newWs.onerror = ws.onerror;
        newWs.onclose = ws.onclose;
      }, 10000);
    };

    // Cleanup is vital to avoid memory leaks
    return () => {
      ws.close();
    };
  }, [symbol]); // Only depends on symbol, not on any functions

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      // The onclose handler will automatically reconnect
    }
  }, []);

  return { isError, reconnect };
};

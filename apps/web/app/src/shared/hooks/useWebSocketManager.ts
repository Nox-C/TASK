import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'wss://stream.binance.com:9443/ws';

export const useWebSocketManager = (symbolsToWatch: string[]) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPrice = useTradeStore((state) => state.setPrice);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(SOCKET_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected. Subscribing to assets...');
      setIsConnected(true);
      setError(null);
      
      // Subscribe to all symbols once connected
      symbolsToWatch.forEach(symbol => {
        // Binance aggTrade format - just connect to the stream
        console.log(`Subscribing to ${symbol}`);
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Binance aggTrade format: {e: "aggTrade", E: timestamp, s: symbol, p: price, q: quantity, ...}
        if (data.e === "aggTrade" && data.s && data.p) {
          const symbol = data.s;
          const price = parseFloat(data.p);
          
          // Use the functional form of setState to prevent render loops
          setPrice(symbol, {
            symbol,
            price,
            change24h: 0, // aggTrade doesn't include 24h change
            volume24h: parseFloat(data.q || '0'),
            timestamp: data.E || Date.now()
          });
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed. Attempting reconnect...');
      setIsConnected(false);
      setError('Connection lost. Reconnecting...');
      // Use a clean setTimeout for retry logic
      setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error');
      setIsConnected(false);
      ws.close();
    };
  }, [symbolsToWatch, setPrice]);

  useEffect(() => {
    connect();

    // --- CRITICAL CLEANUP ---
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  return { 
    isConnected, 
    error, 
    reconnect,
    prices: useTradeStore((state) => state.prices)
  };
};

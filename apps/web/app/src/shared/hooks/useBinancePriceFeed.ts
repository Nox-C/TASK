import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { PriceData } from '../types/trading';

const BASE_URL = 'wss://stream.binance.com:9443/ws';

export const useBinancePriceFeed = (symbols: string[]) => {
  // useRef for WebSocket instance (updating ref does not trigger re-render)
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPrice = useTradeStore((state) => state.setPrice);
  
  // Local buffer for throttled updates (useRef to prevent re-renders)
  const priceBufferRef = useRef<Map<string, PriceData>>(new Map());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Safe reconnection logic with exponential backoff (wrapped in useCallback)
  const reconnectBinance = useCallback(() => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Implement exponential backoff
    const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 seconds
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect Binance WebSocket (attempt ${reconnectAttemptsRef.current + 1})`);
      
      // Check if current socket is open or connecting, close it first
      if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
        socketRef.current.close();
      }
      
      // Create new connection
      connect();
      reconnectAttemptsRef.current++;
    }, backoffDelay);
  }, []);

  const connect = useCallback(() => {
    // Create combined stream URL for all symbols
    const streamNames = symbols.map(symbol => `${symbol.toLowerCase()}@aggTrade`);
    const combinedStreamUrl = `${BASE_URL}/${streamNames.join('/')}`;

    // Initialize WebSocket connection
    const socket = new WebSocket(combinedStreamUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Binance WebSocket connected');
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0; // Reset reconnection attempts on successful connection
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle combined stream response
        if (data.stream && data.data) {
          // Combined stream format: { stream: "btcusdt@aggTrade", data: {...} }
          const symbol = data.data.s;
          const price = parseFloat(data.data.p);
          
          const priceData: PriceData = {
            symbol,
            price,
            change24h: 0, // aggTrade doesn't include 24h change
            volume24h: parseFloat(data.data.q || '0'),
            timestamp: data.data.E || Date.now()
          };
          
          // Buffer the price data instead of updating state immediately
          priceBufferRef.current.set(symbol, priceData);
        }
        // Handle single stream response (fallback)
        else if (data.e === "aggTrade" && data.s && data.p) {
          const symbol = data.s;
          const price = parseFloat(data.p);
          
          const priceData: PriceData = {
            symbol,
            price,
            change24h: 0,
            volume24h: parseFloat(data.q || '0'),
            timestamp: data.E || Date.now()
          };
          
          priceBufferRef.current.set(symbol, priceData);
        }
      } catch (err) {
        console.error('Error parsing Binance message:', err);
      }
    };

    socket.onclose = (event) => {
      console.log('Binance WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setError('Connection lost. Reconnecting...');
      
      // Handle 24-hour reset or other disconnections with exponential backoff
      reconnectBinance();
    };

    socket.onerror = (error) => {
      console.error('Binance WebSocket error:', error);
      setError('Connection error');
      setIsConnected(false);
    };

    // Throttled state updates every 500ms (data buffering)
    updateIntervalRef.current = setInterval(() => {
      if (priceBufferRef.current.size > 0) {
        // Update React state with buffered prices
        priceBufferRef.current.forEach((priceData, symbol) => {
          setPrice(symbol, priceData);
        });
        // Clear buffer after updating
        priceBufferRef.current.clear();
      }
    }, 500);
  }, [symbols, setPrice, reconnectBinance]);

  // Connection initialization with empty dependency array (runs only once)
  useEffect(() => {
    connect();

    // Cleanup function
    return () => {
      console.log('Cleaning up Binance WebSocket connection');
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
      priceBufferRef.current.clear();
    };
  }, [connect]); // Only depends on connect, which is stable due to useCallback

  return { isConnected, error, reconnect: reconnectBinance };
};

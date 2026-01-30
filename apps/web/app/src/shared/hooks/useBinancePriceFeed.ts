import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { PriceData } from '../types/trading';
import { connect } from 'http2';

const BASE_URL = 'wss://stream.binance.com:9443/ws';

export const useBinancePriceFeed = (symbols: string[]) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPrice = useTradeStore((state) => state.setPrice);
  
  // Local buffer for throttled updates
  const priceBufferRef = useRef<Map<string, PriceData>>(new Map());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      
      // Handle 24-hour reset or other disconnections
      setTimeout(() => {
        // Reconnect after 5 seconds (graceful shutdown)
        connect();
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error('Binance WebSocket error:', error);
      setError('Connection error');
      setIsConnected(false);
    };

    // Handle Binance ping/pong heartbeat (WebSocket API doesn't have onping, so we handle it in onmessage)
    let lastPingTime = 0;
    const originalOnMessage = socket.onmessage;
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if it's a ping message
        if (data.event === 'ping') {
          console.log('Received ping from Binance, sending pong');
          socket.send(JSON.stringify({ event: 'pong', time: data.time }));
          lastPingTime = Date.now();
          return;
        }
        
        // Handle normal trade data
        if (data.stream && data.data) {
          const symbol = data.data.s;
          const price = parseFloat(data.data.p);
          
          const priceData: PriceData = {
            symbol,
            price,
            change24h: 0,
            volume24h: parseFloat(data.data.q || '0'),
            timestamp: data.data.E || Date.now()
          };
          
          priceBufferRef.current.set(symbol, priceData);
        }
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

    // Throttled state updates every 500ms
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
  }, [symbols, setPrice]);

  useEffect(() => {
    connect();

    // Cleanup function
    return () => {
      console.log('Cleaning up Binance WebSocket connection');
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
      priceBufferRef.current.clear();
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setTimeout(connect, 1000);
  }, [connect]);

  return { isConnected, error, reconnect };
};

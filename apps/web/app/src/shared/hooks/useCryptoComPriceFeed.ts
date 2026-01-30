import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { PriceData } from '../types/trading';

const CRYPTO_COM_WS_URL = 'wss://stream.crypto.com/v2/market';

export const useCryptoComPriceFeed = (symbols: string[]) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPrice = useTradeStore((state) => state.setPrice);
  
  // Local buffer for throttled updates
  const priceBufferRef = useRef<Map<string, PriceData>>(new Map());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const socket = new WebSocket(CRYPTO_COM_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Crypto.com WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      // Subscribe to all symbols
      const subscribeMessage = {
        id: Date.now(),
        method: 'subscribe',
        params: {
          channels: symbols.map(symbol => ({
            name: 'trade',
            symbols: [symbol.toLowerCase()]
          }))
        }
      };
      socket.send(JSON.stringify(subscribeMessage));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle trade messages
        if (data.method === 'trade' && data.result && data.result.data) {
          const trades = data.result.data;
          trades.forEach((trade: any) => {
            const symbol = trade.s.toUpperCase();
            const price = parseFloat(trade.p);
            
            const priceData: PriceData = {
              symbol,
              price,
              change24h: 0, // Trade messages don't include 24h change
              volume24h: parseFloat(trade.q) || 0,
              timestamp: trade.t || Date.now()
            };
            
            // Buffer the price data instead of updating state immediately
            priceBufferRef.current.set(symbol, priceData);
          });
        }
      } catch (err) {
        console.error('Error parsing Crypto.com message:', err);
      }
    };

    socket.onclose = (event) => {
      console.log('Crypto.com WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setError('Connection lost. Reconnecting...');
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        connect();
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error('Crypto.com WebSocket error:', error);
      setError('Connection error');
      setIsConnected(false);
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
      console.log('Cleaning up Crypto.com WebSocket connection');
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

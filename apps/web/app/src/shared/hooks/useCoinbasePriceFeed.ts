import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { PriceData } from '../types/trading';

const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';

export const useCoinbasePriceFeed = (symbols: string[]) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPrice = useTradeStore((state) => state.setPrice);
  
  // Local buffer for throttled updates
  const priceBufferRef = useRef<Map<string, PriceData>>(new Map());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const socket = new WebSocket(COINBASE_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Coinbase WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      // Subscribe to all symbols
      const subscribeMessage = {
        type: 'subscribe',
        product_ids: symbols.map(s => s.replace('USDT', 'USD')), // Coinbase uses USD, not USDT
        channels: ['ticker']
      };
      socket.send(JSON.stringify(subscribeMessage));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle ticker messages
        if (data.type === 'ticker' && data.product_id) {
          const symbol = data.product_id.replace('USD', 'USDT'); // Convert back to USDT format
          const price = parseFloat(data.price);
          
          const priceData: PriceData = {
            symbol,
            price,
            change24h: parseFloat(data.open_24h) ? ((price - parseFloat(data.open_24h)) / parseFloat(data.open_24h)) * 100 : 0,
            volume24h: parseFloat(data.volume_24h) || 0,
            timestamp: Date.now()
          };
          
          // Buffer the price data instead of updating state immediately
          priceBufferRef.current.set(symbol, priceData);
        }
      } catch (err) {
        console.error('Error parsing Coinbase message:', err);
      }
    };

    socket.onclose = (event) => {
      console.log('Coinbase WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setError('Connection lost. Reconnecting...');
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        connect();
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error('Coinbase WebSocket error:', error);
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
      console.log('Cleaning up Coinbase WebSocket connection');
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

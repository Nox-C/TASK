import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { PriceData } from '../types/trading';

const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';

export const useCoinbasePriceFeed = (symbols: string[]) => {
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
  const reconnectCoinbase = useCallback(() => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Implement exponential backoff
    const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 seconds
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect Coinbase WebSocket (attempt ${reconnectAttemptsRef.current + 1})`);
      
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
    const socket = new WebSocket(COINBASE_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Coinbase WebSocket connected');
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0; // Reset reconnection attempts on successful connection
      
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
      
      // Reconnect with exponential backoff
      reconnectCoinbase();
    };

    socket.onerror = (error) => {
      console.error('Coinbase WebSocket error:', error);
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
  }, [symbols, setPrice, reconnectCoinbase]);

  // Connection initialization with empty dependency array (runs only once)
  useEffect(() => {
    connect();

    // Cleanup function
    return () => {
      console.log('Cleaning up Coinbase WebSocket connection');
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

  return { isConnected, error, reconnect: reconnectCoinbase };
};

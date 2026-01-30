import { useCallback, useEffect, useRef, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { PriceData } from '../types/trading';

// DEX integration using 1inch API for price aggregation
const ONE_INCH_API_URL = 'https://api.1inch.dev/swap/v6.0';

export const useDEXPriceFeed = (symbols: string[]) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPrice = useTradeStore((state) => state.setPrice);
  
  // Local buffer for throttled updates
  const priceBufferRef = useRef<Map<string, PriceData>>(new Map());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDEXPrices = useCallback(async () => {
    try {
      // For DEX, we'll use 1inch to get prices from multiple DEXs
      const baseToken = '0xA0b86a33E6441e6C7D0e6B3e6d1e6e6e6e6e6e6e'; // ETH address (example)
      
      for (const symbol of symbols) {
        if (symbol.includes('ETH')) {
          // Get ETH price in USDT from DEXs
          const response = await fetch(`${ONE_INCH_API_URL}/1/quote?src=${baseToken}&dst=0xdAC17F958D2ee523a2206206994597C13D831ec7&amount=1000000000000000000`, {
            headers: {
              'Authorization': 'Bearer YOUR_1INCH_API_KEY' // This should be in environment variables
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const price = parseFloat(data.dstAmount) / 1e6; // USDT has 6 decimals
            
            const priceData: PriceData = {
              symbol,
              price,
              change24h: 0, // Would need historical data for this
              volume24h: 0, // Would need volume data from DEXs
              timestamp: Date.now()
            };
            
            priceBufferRef.current.set(symbol, priceData);
          }
        }
      }
      
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching DEX prices:', err);
      setError('Failed to fetch DEX prices');
      setIsConnected(false);
    }
  }, [symbols]);

  const connect = useCallback(() => {
    // Start polling for DEX prices (since DEXs don't have real-time WebSocket like CEXs)
    fetchDEXPrices(); // Initial fetch
    
    // Poll every 2 seconds for DEX prices
    pollingIntervalRef.current = setInterval(fetchDEXPrices, 2000);
    
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
  }, [fetchDEXPrices, setPrice]);

  useEffect(() => {
    connect();

    // Cleanup function
    return () => {
      console.log('Cleaning up DEX price polling');
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      priceBufferRef.current.clear();
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    setTimeout(connect, 1000);
  }, [connect]);

  return { isConnected, error, reconnect };
};

"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Card, Button, StatusPill, Skeleton } from "@task/ui";
import { connectActivity } from "../lib/ws";

interface PriceTick {
  symbol: string;
  price: number;
  timestamp: number;
}

interface WatchlistItem {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
}

export default function MarketsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USD");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { symbol: "BTC-USD", price: 45000, change24h: 2.5, volume: 1200000 },
    { symbol: "ETH-USD", price: 3200, change24h: -1.2, volume: 800000 },
    { symbol: "SOL-USD", price: 120, change24h: 5.8, volume: 400000 },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const disconnect = connectActivity({
      onEvent: (data) => {
        if ((data as any).type === 'market' && (data as any).payload?.symbol) {
          const priceData: any = (data as any).payload
          setCurrentPrice(priceData.price || 0)
          setWatchlist((prev) => prev.map((item) => item.symbol === priceData.symbol ? { ...item, price: priceData.price || 0 } : item))
          setIsConnected(true)
          
          // Update chart with real-time data
          if (chartContainerRef.current && (chartContainerRef.current as any)._lineSeries && priceData.symbol === selectedSymbol) {
            const lineSeries = (chartContainerRef.current as any)._lineSeries;
            const timestamp = Math.floor((priceData.timestamp || Date.now()) / 1000);
            lineSeries.update({
              time: timestamp,
              value: priceData.price
            });
          }
        }
      },
      onStatusChange: (s) => setIsConnected(s === 'connected'),
    })
    return () => disconnect()
  }, [selectedSymbol])

  useEffect(() => {
    // Initialize TradingView Lightweight Charts
    if (chartContainerRef.current) {
      // Clear previous chart
      chartContainerRef.current.innerHTML = '';
      
      // Import and initialize chart
      import('lightweight-charts').then(({ createChart, ColorType }) => {
        if (!chartContainerRef.current) return;
        
        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { type: ColorType.Solid, color: '#1f2937' },
            textColor: '#d1d5db',
          },
          grid: {
            vertLines: { color: '#374151' },
            horzLines: { color: '#374151' },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: '#485563',
          },
          timeScale: {
            borderColor: '#485563',
            timeVisible: true,
            secondsVisible: false,
          },
        });

        const lineSeries = chart.addLineSeries({
          color: '#10b981',
          lineWidth: 2,
        });

        // Add some sample data points
        const now = Date.now();
        const sampleData = Array.from({ length: 50 }, (_, i) => ({
          time: Math.floor((now - (50 - i) * 60000) / 1000), // 1 minute intervals
          value: currentPrice + (Math.random() - 0.5) * currentPrice * 0.02, // ±2% variation
        }));
        
        lineSeries.setData(sampleData);

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current) {
            chart.applyOptions({ 
              width: chartContainerRef.current.clientWidth,
              height: 400 
            });
          }
        };

        window.addEventListener('resize', handleResize);

        // Store chart reference for cleanup
        (chartContainerRef.current as any)._chart = chart;
        (chartContainerRef.current as any)._lineSeries = lineSeries;
        (chartContainerRef.current as any)._cleanup = () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      }).catch(error => {
        console.error('Failed to load lightweight-charts:', error);
        // Fallback to placeholder
        if (chartContainerRef.current) {
          chartContainerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-700 rounded">
              <div class="text-center">
                <div class="text-2xl mb-2">📈</div>
                <div class="text-lg font-semibold">${selectedSymbol}</div>
                <div class="text-3xl font-bold text-green-400">$${currentPrice.toLocaleString()}</div>
                <div class="text-sm text-gray-400 mt-2">Chart Loading...</div>
              </div>
            </div>
          `;
        }
      });
    }

    // Cleanup function
    return () => {
      if (chartContainerRef.current && (chartContainerRef.current as any)._cleanup) {
        (chartContainerRef.current as any)._cleanup();
      }
    };
  }, [selectedSymbol, currentPrice]);

  const addToWatchlist = () => {
    const symbol = prompt("Enter symbol (e.g., DOGE-USD):");
    if (symbol && !watchlist.find((item) => item.symbol === symbol)) {
      setWatchlist([
        ...watchlist,
        {
          symbol,
          price: 0,
          change24h: 0,
          volume: 0,
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Markets</h1>
            <p className="text-gray-400">Live price data and charts</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Live Data</span>
              <StatusPill status={isConnected ? 'connected' : 'disconnected'} />
            </div>
            <Link href="/"><Button variant="secondary">Back to Home</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Watchlist */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Watchlist</h2>
                <button onClick={addToWatchlist} className="text-blue-400 hover:text-blue-300 text-sm">+ Add</button>
              </div>

              <div className="space-y-3">
                {watchlist.map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`p-3 rounded cursor-pointer transition-colors ${selectedSymbol === item.symbol ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{item.symbol}</div>
                        <div className="text-sm text-gray-400">Vol: {item.volume.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${item.price.toLocaleString()}</div>
                        <div className={`text-sm ${item.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Chart */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedSymbol}</h2>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">1H</Button>
                  <Button variant="primary" size="sm">1D</Button>
                  <Button variant="ghost" size="sm">1W</Button>
                  <Button variant="ghost" size="sm">1M</Button>
                </div>
              </div>

              {/* Chart Container */}
              <div ref={chartContainerRef} className="h-96 bg-gray-700 rounded">
                {/* Chart will be rendered here */}
              </div>

              {/* Chart Controls */}
              <div className="mt-4 flex justify-between items-center">
                <div className="flex space-x-4 text-sm text-gray-400">
                  <span>Last Update: {new Date().toLocaleTimeString()}</span>
                  <span>Source: WebSocket</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">Fullscreen</Button>
                  <Button variant="ghost" size="sm">Export</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { Button, Card, StatusPill } from "@task/ui";
import { CandlestickSeries, LineSeries } from "lightweight-charts";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

interface ExchangeStatus {
  name: string;
  connected: boolean;
  lastUpdate: number;
}

export default function MarketsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USDT");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [chartType, setChartType] = useState<"candlestick" | "line">(
    "candlestick"
  );
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [exchanges, setExchanges] = useState<ExchangeStatus[]>([
    { name: "Binance", connected: false, lastUpdate: 0 },
    { name: "Coinbase", connected: false, lastUpdate: 0 },
  ]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Initialize default watchlist symbols
  useEffect(() => {
    const defaultSymbols = [
      "BTC-USDT", "ETH-USDT", "SOL-USDT", "ADA-USDT",
      "DOT-USDT", "MATIC-USDT", "UNI-USDT", "LINK-USDT"
    ];
    
    setWatchlist(defaultSymbols.map(symbol => ({
      symbol,
      price: 0,
      change24h: 0,
      volume: 0
    })));
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const disconnect = connectActivity({
      onEvent: (data) => {
        if ((data as any).type === "market" && (data as any).payload?.symbol) {
          const priceData: any = (data as any).payload;
          
          // Update current price if this is the selected symbol
          if (priceData.symbol === selectedSymbol) {
            setCurrentPrice(priceData.price || 0);
          }
          
          // Update or add to watchlist with real data
          setWatchlist((prev) => {
            const existingIndex = prev.findIndex(item => item.symbol === priceData.symbol);
            
            if (existingIndex >= 0) {
              // Update existing item
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                price: priceData.price || 0,
                change24h: priceData.change || 0,
                volume: priceData.volume || 0,
              };
              return updated;
            } else if (prev.length < 20) {
              // Add new symbol if we have room
              return [...prev, {
                symbol: priceData.symbol,
                price: priceData.price || 0,
                change24h: priceData.change || 0,
                volume: priceData.volume || 0,
              }];
            }
            return prev;
          });
          
          setIsConnected(true);

          // Update exchange status based on data source
          if (priceData.source) {
            setExchanges((prev) =>
              prev.map((ex) =>
                ex.name.toLowerCase() === priceData.source?.toLowerCase()
                  ? { ...ex, connected: true, lastUpdate: Date.now() }
                  : ex
              )
            );
          }

          // Update chart with real-time data for line charts
          if (
            chartContainerRef.current &&
            (chartContainerRef.current as any)._lineSeries &&
            priceData.symbol === selectedSymbol &&
            chartType === "line"
          ) {
            const lineSeries = (chartContainerRef.current as any)._lineSeries;
            const timestamp = Math.floor(
              (priceData.timestamp || Date.now()) / 1000
            );
            lineSeries.update({
              time: timestamp,
              value: priceData.price,
            });
          }
        }
      },
      onStatusChange: (s) => setIsConnected(s === "connected"),
    });
    return () => disconnect();
  }, [selectedSymbol, chartType]);

  // Load chart data
  useEffect(() => {
    loadChartData();
  }, [selectedSymbol, selectedTimeframe, chartType]);

  const loadChartData = async () => {
    if (!chartContainerRef.current) return;

    setIsLoadingChart(true);
    chartContainerRef.current.innerHTML =
      '<div class="flex items-center justify-center h-full"><div class="text-lg text-gray-400">Loading chart data...</div></div>';

    try {
      // Fetch historical data from API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(
        `${apiUrl}/market/ohlcv/${selectedSymbol}?timeframe=${selectedTimeframe}&limit=200`
      );

      if (!response.ok) throw new Error("Failed to fetch chart data");

      const ohlcvData = await response.json();

      if (!ohlcvData || ohlcvData.length === 0) {
        throw new Error("No data available");
      }

      // Clear previous chart
      if ((chartContainerRef.current as any)._cleanup) {
        (chartContainerRef.current as any)._cleanup();
      }
      chartContainerRef.current.innerHTML = "";

      // Import and initialize chart
      const { createChart, ColorType } = await import("lightweight-charts");

      if (!chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { type: ColorType.Solid, color: "#1a1d29" }, // WALL-E dark blue
          textColor: "#e4c087", // WALL-E yellow-beige
        },
        grid: {
          vertLines: { color: "#2a2e3f" },
          horzLines: { color: "#2a2e3f" },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: "#fbbf24", // WALL-E yellow
        },
        timeScale: {
          borderColor: "#fbbf24", // WALL-E yellow
          timeVisible: true,
          secondsVisible: false,
        },
      });

      if (chartType === "candlestick") {
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: "#10b981", // green
          downColor: "#ef4444", // red
          borderUpColor: "#10b981",
          borderDownColor: "#ef4444",
          wickUpColor: "#10b981",
          wickDownColor: "#ef4444",
        });

        candlestickSeries.setData(ohlcvData);
        (chartContainerRef.current as any)._candlestickSeries =
          candlestickSeries;
      } else {
        const lineSeries = chart.addSeries(LineSeries, {
          color: "#fbbf24", // WALL-E yellow
          lineWidth: 2,
        });

        // Convert OHLCV to line data (use close prices)
        const lineData = ohlcvData.map((candle: any) => ({
          time: candle.time,
          value: candle.close,
        }));

        lineSeries.setData(lineData);
        (chartContainerRef.current as any)._lineSeries = lineSeries;
      }

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: 500,
          });
        }
      };

      window.addEventListener("resize", handleResize);

      // Store chart reference for cleanup
      (chartContainerRef.current as any)._chart = chart;
      (chartContainerRef.current as any)._cleanup = () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };

      setIsLoadingChart(false);
    } catch (error) {
      console.error("Failed to load chart:", error);
      setIsLoadingChart(false);

      // Show error placeholder
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-800 rounded">
            <div class="text-center">
              <div class="text-4xl mb-4">⚠️</div>
              <div class="text-lg font-semibold text-red-400">Failed to load chart data</div>
              <div class="text-sm text-gray-400 mt-2">${
                (error as Error).message
              }</div>
              <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-walle-yellow text-walle-brown rounded hover:bg-walle-orange">
                Retry
              </button>
            </div>
          </div>
        `;
      }
    }
  };

  const addToWatchlist = async () => {
    try {
      // Fetch available symbols from API
      const response = await fetch("/exchange/symbols");
      const data = await response.json();

      // Create a flat list of all symbols
      const allSymbols = Object.values(data.categories).flat() as string[];
      const symbolList = allSymbols.join(", ");

      const symbol = prompt(
        `Enter symbol (e.g., DOGE-USDT, SHIB-USDT, ARB-USDT)\n\nAvailable symbols:\n${symbolList.substring(
          0,
          500
        )}...`
      );

      if (
        symbol &&
        !watchlist.find((item) => item.symbol === symbol.toUpperCase())
      ) {
        setWatchlist([
          ...watchlist,
          {
            symbol: symbol.toUpperCase(),
            price: 0,
            change24h: 0,
            volume: 0,
          },
        ]);
      }
    } catch (error) {
      // Fallback to simple prompt
      const symbol = prompt("Enter symbol (e.g., DOGE-USDT):");
      if (
        symbol &&
        !watchlist.find((item) => item.symbol === symbol.toUpperCase())
      ) {
        setWatchlist([
          ...watchlist,
          {
            symbol: symbol.toUpperCase(),
            price: 0,
            change24h: 0,
            volume: 0,
          },
        ]);
      }
    }
  };

  const timeframes = [
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "1H", value: "1h" },
    { label: "4H", value: "4h" },
    { label: "1D", value: "1d" },
    { label: "1W", value: "1w" },
  ];

  return (
    <div className="min-h-screen bg-walle-darkblue text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-walle-yellow">
              🤖 Markets - WALL-E Trading
            </h1>
            <p className="text-walle-beige">
              Live price data and advanced charts
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-walle-beige">Live Data</span>
              <StatusPill status={isConnected ? "connected" : "disconnected"} />
            </div>
            <Link href="/">
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </div>

        {/* Exchange Status Bar */}
        <Card className="p-4 mb-6 bg-walle-darkgray border-walle-rust">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-walle-yellow">
              Exchange Connections
            </h3>
            <div className="flex gap-4">
              {exchanges.map((ex) => (
                <div key={ex.name} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      ex.connected ? "bg-green-500" : "bg-red-500"
                    } animate-pulse`}
                  />
                  <span className="text-sm text-walle-beige">{ex.name}</span>
                  {ex.connected && ex.lastUpdate > 0 && (
                    <span className="text-xs text-gray-500">
                      {Math.floor((Date.now() - ex.lastUpdate) / 1000)}s ago
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Watchlist */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-walle-darkgray border-walle-rust">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-walle-yellow">
                  Watchlist
                </h2>
                <button
                  onClick={addToWatchlist}
                  className="text-walle-yellow hover:text-walle-orange text-sm font-bold"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-3">
                {watchlist.map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedSymbol === item.symbol
                        ? "bg-walle-rust border border-walle-yellow"
                        : "bg-walle-darkblue hover:bg-walle-brown"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-walle-yellow">
                          {item.symbol}
                        </div>
                        <div className="text-sm text-walle-beige">
                          Vol: {item.volume.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${item.price.toLocaleString()}
                        </div>
                        <div
                          className={`text-sm ${
                            item.change24h >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {item.change24h >= 0 ? "+" : ""}
                          {item.change24h.toFixed(2)}%
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
            <Card className="p-6 bg-walle-darkgray border-walle-rust">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-walle-yellow">
                    {selectedSymbol}
                  </h2>
                  {currentPrice > 0 && (
                    <div className="text-xl font-bold text-white">
                      ${currentPrice.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Chart Type Selector */}
                  <div className="flex gap-1 bg-walle-darkblue rounded p-1">
                    <button
                      onClick={() => setChartType("candlestick")}
                      className={`px-3 py-1 rounded text-sm ${
                        chartType === "candlestick"
                          ? "bg-walle-yellow text-walle-brown font-bold"
                          : "text-walle-beige hover:bg-walle-brown"
                      }`}
                    >
                      📊 Candles
                    </button>
                    <button
                      onClick={() => setChartType("line")}
                      className={`px-3 py-1 rounded text-sm ${
                        chartType === "line"
                          ? "bg-walle-yellow text-walle-brown font-bold"
                          : "text-walle-beige hover:bg-walle-brown"
                      }`}
                    >
                      📈 Line
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex gap-2 mb-4">
                {timeframes.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setSelectedTimeframe(tf.value)}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      selectedTimeframe === tf.value
                        ? "bg-walle-yellow text-walle-brown"
                        : "bg-walle-darkblue text-walle-beige hover:bg-walle-brown"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Chart Container */}
              <div
                ref={chartContainerRef}
                className="h-[500px] bg-walle-darkblue rounded border border-walle-rust"
              >
                {/* Chart will be rendered here */}
              </div>

              {/* Chart Info */}
              <div className="mt-4 flex justify-between items-center text-sm text-walle-beige">
                <div className="flex gap-4">
                  <span>Last Update: {new Date().toLocaleTimeString()}</span>
                  <span>Timeframe: {selectedTimeframe}</span>
                  <span>
                    Type: {chartType === "candlestick" ? "Candlestick" : "Line"}
                  </span>
                </div>
                <button
                  onClick={loadChartData}
                  disabled={isLoadingChart}
                  className="px-3 py-1 bg-walle-rust text-white rounded hover:bg-walle-orange disabled:opacity-50"
                >
                  {isLoadingChart ? "⏳ Loading..." : "🔄 Refresh"}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Api } from "../lib/api";
import { Button, Card, KpiCard, Skeleton } from "@task/ui";
import { createChart, ColorType, LineSeries } from "lightweight-charts";

interface BacktestReport {
  ticksPlayed?: number;
  ordersPlaced?: number;
  balances?: Array<{ asset: string; amount: string | number }>;
  positions?: Array<{ symbol: string; qty: string | number; avgPrice: string | number }>;
  fills?: Array<{ id: string; symbol: string; qty: string | number; price: string | number; ts: string | number }>;
}

export default function BacktestPage() {
  const [symbol, setSymbol] = useState("BTC-USD");
  const [fromTs, setFromTs] = useState("");
  const [toTs, setToTs] = useState("");
  const [thresholdBuy, setThresholdBuy] = useState<string>("");
  const [thresholdSell, setThresholdSell] = useState<string>("");
  const [qty, setQty] = useState<number>(0.01);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  const runBacktest = async () => {
    try {
      setLoading(true);
      setError(null);
      setReport(null);

      const rules: any[] = [];
      if (thresholdBuy) rules.push({ symbol, type: "buy_below", threshold: String(thresholdBuy), qty });
      if (thresholdSell) rules.push({ symbol, type: "sell_above", threshold: String(thresholdSell), qty });

      const res = await Api.backtest.run({ symbol, fromTs, toTs, rules, persist: true });
      setReport(res as any);
    } catch (e: any) {
      setError(e?.message || "Failed to run backtest");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!report || !report.fills || report.fills.length === 0) return;
    const el = chartRef.current;
    if (!el) return;

    // Build simple equity curve from fills
    const fills = [...report.fills].sort((a, b) => Number(a.ts) - Number(b.ts));
    const startCash = 10000;
    let cash = startCash;
    const data: { time: number; value: number }[] = [];
    for (let i = 0; i < fills.length; i++) {
      const f = fills[i];
      const qty = Number(f.qty);
      const price = Number(f.price);
      const isBuy = i % 2 === 0; // naive inference; replace with side when available
      cash += isBuy ? -qty * price : qty * price;
      data.push({ time: Math.floor(Number(f.ts) / 1000) as any, value: cash });
    }

    // Clear previous
    el.innerHTML = '';
    const chart = createChart(el, {
      height: el.clientHeight,
      width: el.clientWidth,
      layout: {
        background: { type: ColorType.Solid, color: '#0b0f19' },
        textColor: '#e5e7eb',
      },
      grid: {
        vertLines: { color: 'rgba(59,130,246,0.12)' },
        horzLines: { color: 'rgba(59,130,246,0.12)' },
      },
      rightPriceScale: { borderColor: 'rgba(59,130,246,0.25)' },
      timeScale: { borderColor: 'rgba(59,130,246,0.25)' },
      crosshair: { mode: 1 },
    });

    // Glow underlay then crisp line to simulate depth
    const glow = chart.addSeries(LineSeries, { color: 'rgba(34,197,94,0.35)' });
    glow.setData(data as any);
    const line = chart.addSeries(LineSeries, { color: 'rgba(34,197,94,1)' });
    line.setData(data as any);

    const onResize = () => chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
    };
  }, [report]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Backtest Lab</h1>
            <p className="text-gray-400">Run simple threshold strategies over historical data</p>
          </div>
          <Link href="/"><Button variant="secondary">Back to Home</Button></Link>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Symbol</label>
              <input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full p-3 bg-gray-700 rounded border border-gray-600" placeholder="BTC-USD" />
            </div>
            <div>
              <label className="block text-sm mb-1">From (ISO)</label>
              <input value={fromTs} onChange={(e) => setFromTs(e.target.value)} className="w-full p-3 bg-gray-700 rounded border border-gray-600" placeholder="2024-01-01T00:00:00Z" />
            </div>
            <div>
              <label className="block text-sm mb-1">To (ISO)</label>
              <input value={toTs} onChange={(e) => setToTs(e.target.value)} className="w-full p-3 bg-gray-700 rounded border border-gray-600" placeholder="2024-02-01T00:00:00Z" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm mb-1">Buy Below Threshold ($)</label>
              <input type="number" value={thresholdBuy} onChange={(e) => setThresholdBuy(e.target.value)} className="w-full p-3 bg-gray-700 rounded border border-gray-600" placeholder="e.g. 42000" />
            </div>
            <div>
              <label className="block text-sm mb-1">Sell Above Threshold ($)</label>
              <input type="number" value={thresholdSell} onChange={(e) => setThresholdSell(e.target.value)} className="w-full p-3 bg-gray-700 rounded border border-gray-600" placeholder="e.g. 47000" />
            </div>
            <div>
              <label className="block text-sm mb-1">Order Qty</label>
              <input type="number" step="0.0001" value={qty} onChange={(e) => setQty(parseFloat(e.target.value))} className="w-full p-3 bg-gray-700 rounded border border-gray-600" placeholder="0.01" />
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={runBacktest} variant="primary" disabled={loading}>
              {loading ? "Running..." : "Run Backtest"}
            </Button>
            {error && <div className="text-red-400 mt-3">{error}</div>}
          </div>
        </Card>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
          </div>
        )}

        {report && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard title="Ticks" value={report.ticksPlayed || 0} hint="Number of ticks replayed" accent="blue" />
              <KpiCard title="Orders" value={report.ordersPlaced || 0} hint="Orders placed by rules" accent="green" />
              <KpiCard title="Fills" value={report.fills?.length || 0} hint="Executed fills" accent="purple" />
            </div>

            <Card className="p-0 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(11,15,25,1) 0%, rgba(2,6,23,1) 100%)' }}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">Equity Curve</h2>
                <p className="text-sm text-gray-400 mb-4">Synthetic equity curve derived from fills (starting cash $10,000)</p>
              </div>
              <div ref={chartRef} className="h-80 w-full" />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Fills</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">ID</th>
                      <th className="text-left py-2">Symbol</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.fills?.map((f) => (
                      <tr key={String(f.id)} className="border-b border-gray-800">
                        <td className="py-2">{String(f.id)}</td>
                        <td className="py-2">{f.symbol}</td>
                        <td className="py-2 text-right">{Number(f.qty).toFixed(6)}</td>
                        <td className="py-2 text-right">${Number(f.price).toFixed(2)}</td>
                        <td className="py-2 text-right">{new Date(Number(f.ts)).toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!report.fills || report.fills.length === 0) && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">No fills</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

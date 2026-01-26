"use client";
import { Button, Card, KpiCard, Skeleton } from "@task/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BalanceItem } from "../components/shared/BalanceItem";
import { PositionCard } from "../components/shared/PositionCard";
import { Api } from "../lib/api";

// Helper to safely parse potentially high-precision string data
const safeParseFloat = (value: number | string): number => {
  return parseFloat(value.toString());
};

interface Balance {
  accountId: string;
  amount: number | string; // Ensure flexibility for string or number
  asset: string;
  id: string;
}

interface Position {
  accountId: string;
  avgPrice: number;
  currentPrice: number;
  id: string;
  qty: number;
  symbol: string;
  unrealizedPnL: number | string; // Updated type
}

interface PnLSnapshot {
  createdAt: string;
  id: string;
  realizedPnl: number | string; // Updated type (Crucial API Fix)
  totalValue: number | string; // Updated type (Crucial API Fix)
  unrealizedPnl: number | string; // Updated type
}

export default function PortfolioPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [pnlSnapshots, setPnlSnapshots] = useState<PnLSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState("paper-account");

  // Helper to calculate total value using parsed data
  const calculateTotalValue = (bals: Balance[]) => {
    return bals.reduce((sum, balance) => {
      const amount = safeParseFloat(balance.amount);
      if (balance.asset === "USD") return sum + amount;
      // Mock calculation retained for crypto assets
      return sum + amount * 1000;
    }, 0);
  };

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const [pnlData] = await Api.pnl.snapshots();

        // Mock balances and positions for now
        setBalances([
          { id: "1", asset: "USD", amount: 10000, accountId: "paper-account" },
          { id: "2", asset: "BTC", amount: 0.5, accountId: "paper-account" },
          { id: "3", asset: "ETH", amount: 2.5, accountId: "paper-account" },
        ]);

        setPositions([
          {
            id: "1",
            symbol: "BTC-USD",
            qty: 0.5,
            avgPrice: 42000,
            currentPrice: 45000,
            unrealizedPnL: 1500,
            accountId: "paper-account",
          },
          {
            id: "2",
            symbol: "ETH-USD",
            qty: 2.5,
            avgPrice: 3000,
            currentPrice: 3200,
            unrealizedPnL: 500,
            accountId: "paper-account",
          },
        ]);

        setPnlSnapshots(pnlData as PnLSnapshot[]);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
        setLoading(false);
      }
    };

    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 30000);
    return () => clearInterval(interval);
  }, [selectedAccount]);

  const totalPortfolioValue = calculateTotalValue(balances);
  const totalUnrealizedPnL = positions.reduce(
    (sum, pos) => sum + safeParseFloat(pos.unrealizedPnL),
    0,
  );

  // Robust parsing for realized PnL from the snapshot array
  const totalRealizedPnL = pnlSnapshots.reduce(
    (sum, snap) => sum + safeParseFloat(snap.realizedPnl),
    0,
  );

  // Helper for PnL formatting
  const formatPnL = (value: number) => {
    const formatted = value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
    if (value >= 0) return `+${formatted}`;
    return formatted;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-72 bg-gray-700 rounded" />
            </div>
            <div className="h-9 w-28 bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-28 bg-gray-900" rounded="xl" />
            <Skeleton className="h-28 bg-gray-900" rounded="xl" />
            <Skeleton className="h-28 bg-gray-900" rounded="xl" />
            <Skeleton className="h-28 bg-gray-900" rounded="xl" />
          </div>
          <Card className="p-6 bg-[#171c26] border border-blue-500/20">
            <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
            <Skeleton className="h-64" rounded="xl" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header (Themed) */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Portfolio</h1>
            <p className="text-gray-400">Account balances and open positions</p>
          </div>
          <Link href="/">
            <Button
              variant="secondary"
              className="bg-gray-900 border border-blue-500/50 hover:bg-gray-800"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Portfolio Summary (Themed and Robust) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Total Value"
            value={`$${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            accent="yellow"
            hint="Across all accounts"
            className="bg-[#171c26] border border-blue-500/20 text-yellow-400"
          />
          <KpiCard
            title="Unrealized P&L"
            value={formatPnL(totalUnrealizedPnL)}
            accent={totalUnrealizedPnL >= 0 ? "green" : "red"}
            hint="Open positions"
            className="bg-[#171c26] border border-blue-500/20"
          />
          <KpiCard
            title="Realized P&L (All Time)"
            value={formatPnL(totalRealizedPnL)}
            accent={totalRealizedPnL >= 0 ? "green" : "red"}
            hint="Closed trades"
            className="bg-[#171c26] border border-blue-500/20"
          />
          <KpiCard
            title="Account Type"
            value="Paper Trading"
            accent="blue"
            hint="Environment"
            className="bg-[#171c26] border border-blue-500/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balances (Componentized and Themed) */}
          <div className="bg-[#171c26] rounded-lg p-6 border border-gray-700/50 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Balances
            </h2>
            <div className="space-y-3">
              {balances.map((balance) => (
                <BalanceItem key={balance.id} balance={balance} />
              ))}
            </div>
          </div>

          {/* Positions (Componentized and Themed) */}
          <div className="bg-[#171c26] rounded-lg p-6 border border-gray-700/50 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Open Positions
            </h2>
            <div className="space-y-3">
              {positions.map((position) => (
                <PositionCard key={position.id} position={position} />
              ))}
              {positions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No open positions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* P&L History (Themed and Robust Parsing) */}
        <div className="mt-8 bg-[#171c26] rounded-lg p-6 border border-gray-700/50 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            P&L History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-right py-3 px-2">Realized P&L</th>
                  <th className="text-right py-3 px-2">Unrealized P&L</th>
                  <th className="text-right py-3 px-2">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {pnlSnapshots.slice(0, 10).map((snapshot) => {
                  const realizedPnl = safeParseFloat(snapshot.realizedPnl);
                  const unrealizedPnl = safeParseFloat(snapshot.unrealizedPnl);
                  const totalValue = safeParseFloat(snapshot.totalValue);

                  return (
                    <tr
                      key={snapshot.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-2">
                        {new Date(snapshot.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(snapshot.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td
                        className={`text-right py-3 px-2 font-mono ${
                          realizedPnl >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {formatPnL(realizedPnl)}
                      </td>
                      <td
                        className={`text-right py-3 px-2 font-mono ${
                          unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {formatPnL(unrealizedPnl)}
                      </td>
                      <td className="text-right py-3 px-2 font-mono text-yellow-400">
                        ${totalValue.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {pnlSnapshots.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No P&L history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

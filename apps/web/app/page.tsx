"use client";
import Link from "next/link";
import { useEffect } from "react";
import { KpiCard, StatusPill, Card, Button, Skeleton } from "@task/ui";
import { useDashboardStore } from "./lib/store";
import { Api } from "./lib/api";

interface Bot {
  id: string;
  name: string;
  active: boolean;
  strategyId: string;
  createdAt: string;
}

interface SystemHealth {
  api: "healthy" | "degraded" | "down";
  database: "healthy" | "degraded" | "down";
  worker: "healthy" | "degraded" | "down";
}

export default function Page() {
  const { bots, stats, health, loading, refresh } = useDashboardStore();

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const quickAction = async (action: string, botId?: string) => {
    try {
      if (action === "start" && botId) {
        await Api.bots.start(botId);
      } else if (action === "stop" && botId) {
        await Api.bots.stop(botId);
      }
      await refresh();
    } catch (error) {
      console.error("Quick action failed:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-700 rounded-xl" />
            <div>
              <div className="h-6 w-64 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-80 bg-gray-700 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
          </div>
          <Skeleton className="h-64" rounded="xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with WALLe Icon */}
        <header className="mb-8 flex items-center space-x-4">
          <img
            src="/wall-e-icon.png"
            alt="WALLe Trading Bot"
            className="w-16 h-16 rounded-lg"
          />
          <div>
            <h1 className="text-4xl font-bold mb-2">TASK Control Panel</h1>
            <p className="text-gray-400">
              Advanced Trading Bot Management Dashboard
            </p>
          </div>
        </header>

        {/* WALLe Branding Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <img
              src="/wall-e-icon.png"
              alt="WALLe"
              className="w-24 h-24 rounded-xl border-4 border-white shadow-xl"
            />
            <div className="text-left">
              <h2 className="text-3xl font-bold text-white">WALLE</h2>
              <p className="text-blue-100">Intelligent Trading Automation</p>
            </div>
          </div>
          <p className="text-white text-lg">
            Powered by Advanced AI & Machine Learning
          </p>
        </div>

        {/* System Health */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">System Health</h2>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  health.api === "healthy"
                    ? "bg-green-500"
                    : health.api === "degraded"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>API</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  health.database === "healthy"
                    ? "bg-green-500"
                    : health.database === "degraded"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>Database</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  health.worker === "healthy"
                    ? "bg-green-500"
                    : health.worker === "degraded"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>Worker</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards using KpiCard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Total Bots" value={stats.totalBots} hint="All bots in system" accent="blue" rightSlot={<img src="/wall-e-icon.png" alt="WALLe" className="w-8 h-8 rounded" />} />
          <KpiCard title="Active Bots" value={stats.activeBots} hint="Currently running" accent="green" rightSlot={<div className="w-8 h-8 bg-green-400 rounded-full animate-pulse" />} />
          <KpiCard title="Portfolio Value" value={`${stats.totalValue.toLocaleString()}`} hint="Total assets" accent="yellow" rightSlot={<div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold">$</div>} />
          <KpiCard title="TASK Runs" value={stats.taskRuns} hint="Automations executed" accent="purple" rightSlot={<div className="w-8 h-8 bg-purple-400 rounded animate-spin" />} />
        </div>

        {/* Enhanced Navigation */}
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-4 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center justify-center mb-2">
              <img
                src="/wall-e-icon.png"
                alt="WALLe"
                className="w-8 h-8 rounded mr-2"
              />
              <h3 className="font-semibold">Dashboard</h3>
            </div>
            <p className="text-sm text-blue-200">System Overview</p>
          </Link>
          <Link
            href="/markets"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 p-4 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <h3 className="font-semibold">Markets</h3>
            </div>
            <p className="text-sm text-green-200">Charts & Watchlist</p>
          </Link>
          <Link
            href="/bots"
            className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 p-4 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center justify-center mb-2">
              <img
                src="/wall-e-icon.png"
                alt="WALLe"
                className="w-8 h-8 rounded mr-2"
              />
              <h3 className="font-semibold">Bots</h3>
            </div>
            <p className="text-sm text-yellow-200">Manage Trading Bots</p>
          </Link>
          <Link
            href="/tasks"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-4 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-purple-400 rounded animate-spin mr-2"></div>
              <h3 className="font-semibold">TASK Studio</h3>
            </div>
            <p className="text-sm text-purple-200">Automation</p>
          </Link>
          <Link
           
            href="/backtest"
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 p-4 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-cyan-400 rounded mr-2"></div>
              <h3 className="font-semibold">Backtest Lab</h3>
            </div>
            <p className="text-sm text-cyan-200">Replay & Reports</p>
          </Link>
        </nav>

        {/* Enhanced Active Bots List */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 mb-8 border border-gray-600 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <img
                src="/wall-e-icon.png"
                alt="WALLe"
                className="w-10 h-10 rounded"
              />
              <h2 className="text-2xl font-bold text-white">
                Active WALLe Bots
              </h2>
            </div>
            <Link
              href="/bots"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {bots
              .filter((bot) => bot.active)
              .slice(0, 5)
              .map((bot) => (
                <div
                  key={bot.id}
                  className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border border-gray-600 hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src="/wall-e-icon.png"
                      alt="WALLe Bot"
                      className="w-8 h-8 rounded"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{bot.name}</h4>
                      <p className="text-sm text-gray-400">
                        Strategy: {bot.strategyId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusPill status="active" />
                    <Button onClick={() => quickAction("stop", bot.id)} variant="danger" size="sm">
                      Stop
                    </Button>
                  </div>
                </div>
              ))}
            {bots.filter((bot) => bot.active).length === 0 && (
              <div className="text-center py-8">
                <img
                  src="/wall-e-icon.png"
                  alt="WALLe"
                  className="w-16 h-16 rounded mx-auto mb-4 opacity-50"
                />
                <p className="text-gray-400">No active WALLe bots running</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start a bot to begin automated trading
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Latest TASK Runs */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="/wall-e-icon.png"
              alt="WALLe"
              className="w-10 h-10 rounded"
            />
            <h2 className="text-2xl font-bold text-white">
              Latest WALLe TASK Runs
            </h2>
          </div>
          <div className="space-y-3">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 animate-pulse"></div>
              <p className="text-gray-400">No recent WALLe task runs</p>
              <p className="text-sm text-gray-500 mt-2">
                TASK automation history will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

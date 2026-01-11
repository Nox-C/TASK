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
      <main className="min-h-screen bg-walle-gray-950 text-walle-text-primary p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-walle-gray-700 rounded-xl" />
            <div>
              <div className="h-6 w-64 bg-walle-gray-700 rounded mb-2" />
              <div className="h-4 w-80 bg-walle-gray-700 rounded" />
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
    <main className="min-h-screen bg-walle-gray-950 text-walle-text-primary p-6">
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

        {/* WALL-E Branding Section */}
        <div className="walle-card mb-8 p-8 text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-8 h-8 bg-walle-yellow-500 rounded-full"></div>
            <div className="absolute top-12 right-8 w-4 h-4 bg-walle-orange-500 rounded-full"></div>
            <div className="absolute bottom-8 left-12 w-6 h-6 bg-walle-yellow-500 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-walle-orange-500 rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-center space-x-6 mb-6">
            <img
              src="/wall-e-icon.png"
              alt="WALL-E"
              className="w-28 h-28 rounded-2xl border-4 border-walle-yellow-500 shadow-2xl walle-heartbeat"
            />
            <div className="text-left">
              <h2 className="text-4xl font-bold text-walle-yellow-400 drop-shadow-lg">WALL-E</h2>
              <p className="text-walle-gray-200 text-lg font-medium">Intelligent Trading Automation</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-walle-green-500 rounded-full walle-pulse"></div>
                <span className="text-walle-gray-300 text-sm">System Online</span>
              </div>
            </div>
          </div>
          <p className="text-walle-gray-200 text-xl font-semibold drop-shadow-md relative z-10">
            🤖 Powered by Advanced AI & Machine Learning 🌱
          </p>
        </div>

        {/* System Health */}
        <div className="walle-card mb-6 p-4">
          <h2 className="text-lg font-semibold mb-3 text-walle-gray-100">System Health</h2>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  health.api === "healthy"
                    ? "bg-walle-green-500 shadow-sm shadow-walle-green-500/50"
                    : health.api === "degraded"
                    ? "bg-walle-yellow-500 shadow-sm shadow-walle-yellow-500/50"
                    : "bg-red-500 shadow-sm shadow-red-500/50"
                }`}
              ></div>
              <span className="text-walle-gray-200">API</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  health.database === "healthy"
                    ? "bg-walle-green-500 shadow-sm shadow-walle-green-500/50"
                    : health.database === "degraded"
                    ? "bg-walle-yellow-500 shadow-sm shadow-walle-yellow-500/50"
                    : "bg-red-500 shadow-sm shadow-red-500/50"
                }`}
              ></div>
              <span className="text-walle-gray-200">Database</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  health.worker === "healthy"
                    ? "bg-walle-green-500 shadow-sm shadow-walle-green-500/50"
                    : health.worker === "degraded"
                    ? "bg-walle-yellow-500 shadow-sm shadow-walle-yellow-500/50"
                    : "bg-red-500 shadow-sm shadow-red-500/50"
                }`}
              ></div>
              <span className="text-walle-gray-200">Worker</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards using KpiCard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Total Bots" 
            value={stats.totalBots} 
            hint="All WALL-E units in system" 
            accent="blue" 
            rightSlot={
              <img 
                src="/wall-e-icon.png" 
                alt="WALL-E" 
                className="w-8 h-8 rounded-lg walle-float" 
              />
            } 
          />
          <KpiCard 
            title="Active Bots" 
            value={stats.activeBots} 
            hint="Currently operational" 
            accent="green" 
            rightSlot={
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-walle-green-500 rounded-full walle-pulse flex items-center justify-center">
                  <span className="text-white text-xs font-bold">●</span>
                </div>
              </div>
            }
          />
          <KpiCard 
            title="Portfolio Value" 
            value={`${stats.totalValue.toLocaleString()}`} 
            hint="Total assets under management" 
            accent="yellow" 
            rightSlot={
              <div className="w-8 h-8 bg-walle-yellow-500 rounded-full flex items-center justify-center text-walle-brown-700 font-bold text-lg">
                💰
              </div>
            }
          />
          <KpiCard 
            title="TASK Runs" 
            value={stats.taskRuns} 
            hint="Automations executed" 
            accent="yellow" 
            rightSlot={
              <div className="w-8 h-8 bg-walle-orange-500 rounded-lg flex items-center justify-center walle-pulse">
                <span className="text-white font-bold">⚡</span>
              </div>
            }
          />
        </div>

        {/* Enhanced Navigation */}
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard" className="walle-nav-card">
            <div className="flex items-center justify-center mb-2">
              <img
                src="/wall-e-icon.png"
                alt="WALLe"
                className="w-8 h-8 rounded mr-2 walle-float"
              />
              <h3 className="font-semibold text-walle-gray-100">Dashboard</h3>
            </div>
            <p className="text-sm text-walle-gray-300">System Overview</p>
          </Link>
          <Link href="/markets" className="walle-nav-card">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-walle-green-500 rounded-full mr-2 walle-pulse"></div>
              <h3 className="font-semibold text-walle-gray-100">Markets</h3>
            </div>
            <p className="text-sm text-walle-gray-300">Charts & Watchlist</p>
          </Link>
          <Link href="/bots" className="walle-nav-card">
            <div className="flex items-center justify-center mb-2">
              <img
                src="/wall-e-icon.png"
                alt="WALLe"
                className="w-8 h-8 rounded mr-2 walle-float"
              />
              <h3 className="font-semibold text-walle-gray-100">Bots</h3>
            </div>
            <p className="text-sm text-walle-gray-300">Manage Trading Bots</p>
          </Link>
          <Link href="/tasks" className="walle-nav-card">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-walle-yellow-500 rounded animate-spin mr-2"></div>
              <h3 className="font-semibold text-walle-gray-100">TASK Studio</h3>
            </div>
            <p className="text-sm text-walle-gray-300">Automation</p>
          </Link>
          <Link href="/backtest" className="walle-nav-card">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-walle-blue-500 rounded mr-2"></div>
              <h3 className="font-semibold text-walle-gray-100">Backtest Lab</h3>
            </div>
            <p className="text-sm text-walle-gray-300">Replay & Reports</p>
          </Link>
        </nav>

        {/* Enhanced Active Bots List */}
        <div className="walle-card p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <img
                src="/wall-e-icon.png"
                alt="WALLe"
                className="w-10 h-10 rounded walle-float"
              />
              <h2 className="text-2xl font-bold text-walle-gray-100">
                Active WALLe Bots
              </h2>
            </div>
            <Link
              href="/bots"
              className="text-walle-yellow-400 hover:text-walle-yellow-300 transition-colors"
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
                  className="flex justify-between items-center p-4 bg-walle-gray-900/50 rounded-lg border border-walle-gray-700 hover:border-walle-yellow-500/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src="/wall-e-icon.png"
                      alt="WALLe Bot"
                      className="w-8 h-8 rounded"
                    />
                    <div>
                      <h4 className="font-semibold text-walle-gray-100">{bot.name}</h4>
                      <p className="text-sm text-walle-gray-400">
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
                <p className="text-walle-gray-400">No active WALLe bots running</p>
                <p className="text-sm text-walle-gray-500 mt-2">
                  Start a bot to begin automated trading
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Latest TASK Runs */}
        <div className="walle-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="/wall-e-icon.png"
              alt="WALLe"
              className="w-10 h-10 rounded walle-float"
            />
            <h2 className="text-2xl font-bold text-walle-gray-100">
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

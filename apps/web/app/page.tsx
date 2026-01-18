"use client";
import { Button, KpiCard, Skeleton, StatusPill } from "@task/ui";
import Link from "next/link";
import { useEffect } from "react";
import { Api } from "./lib/api";
import { useDashboardStore } from "./lib/store";
import { connectActivity } from "./lib/ws";

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
  const { 
    bots, 
    stats, 
    health, 
    loading, 
    taskRuns, 
    refresh, 
    updateMarketData, 
    addActivity, 
    setWebSocketStatus 
  } = useDashboardStore();

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const disconnect = connectActivity({
      onEvent: (evt) => {
        addActivity({ type: evt.type, message: evt.message });
        
        // Update market data from WebSocket
        if (evt.type === 'market' && evt.payload?.symbol && evt.payload?.price) {
          updateMarketData(
            evt.payload.symbol,
            evt.payload.price,
            evt.payload.timestamp || Date.now()
          );
        }
      },
      onStatusChange: (status) => {
        setWebSocketStatus(status);
      },
    });

    return disconnect;
  }, [addActivity, updateMarketData, setWebSocketStatus]);

  const quickAction = async (action: string, botId?: string) => {
    try {
      if (action === "start" && botId) {
        await Api.bots.start(botId);
      } else if (action === "stop" && botId) {
        await Api.bots.stop(botId);
      }
      await refresh();
    } catch (error) {
      // Log error for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.error("Quick action failed:", error);
      }
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

        {/* WALL-E Branding Section */}
        <div className="mb-8 p-8 bg-gradient-to-br from-walle-yellow via-walle-orange to-walle-brown rounded-2xl text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full"></div>
            <div className="absolute top-12 right-8 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute bottom-8 left-12 w-6 h-6 bg-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10 flex items-center justify-center space-x-6 mb-6">
            <img
              src="/wall-e-icon.png"
              alt="WALL-E"
              className="w-28 h-28 rounded-2xl border-4 border-white shadow-2xl animate-walleGlow"
            />
            <div className="text-left">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                WALL-E
              </h2>
              <p className="text-white/90 text-lg font-medium">
                Intelligent Trading Automation
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-walle-green rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm">System Online</span>
              </div>
            </div>
          </div>
          <p className="text-white text-xl font-semibold drop-shadow-md relative z-10">
            🤖 Powered by Advanced AI & Machine Learning 🌱
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
                    ? "bg-green-500 animate-pulse"
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
                    ? "bg-green-500 animate-pulse"
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
                    ? "bg-green-500 animate-pulse"
                    : health.worker === "degraded"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>Worker</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  health.websocket === "connected"
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></div>
              <span>Live Feed</span>
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
                className="w-8 h-8 rounded-lg animate-float"
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
                <div className="w-8 h-8 bg-walle-green rounded-full animate-pulse flex items-center justify-center">
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
              <div className="w-8 h-8 bg-walle-yellow rounded-full flex items-center justify-center text-walle-brown font-bold text-lg">
                💰
              </div>
            }
          />
          <KpiCard
            title="TASK Runs"
            value={stats.taskRuns}
            hint="Automations executed"
            accent="purple"
            rightSlot={
              <div className="w-8 h-8 bg-purple-400 rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-white font-bold">⚡</span>
              </div>
            }
          />
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
                    <Button
                      onClick={() => quickAction("stop", bot.id)}
                      variant="danger"
                      size="sm"
                    >
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <img
                src="/wall-e-icon.png"
                alt="WALLe"
                className="w-10 h-10 rounded"
              />
              <h2 className="text-2xl font-bold text-white">
                Latest WALLe TASK Runs
              </h2>
            </div>
            <Link
              href="/tasks"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {taskRuns.slice(0, 5).map((run) => (
              <div
                key={run.id}
                className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border border-gray-600 hover:border-purple-400 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    run.status === 'completed' ? 'bg-green-500 animate-pulse' :
                    run.status === 'failed' ? 'bg-red-500' :
                    run.status === 'running' ? 'bg-blue-500 animate-pulse' :
                    'bg-yellow-500'
                  }`}></div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {run.task?.name || `Task ${run.taskId.slice(0, 8)}`}
                    </h4>
                    <p className="text-sm text-gray-400">
                      Started: {new Date(run.startedAt).toLocaleString()}
                      {run.finishedAt && ` • Finished: ${new Date(run.finishedAt).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <StatusPill status={run.status === 'completed' ? 'success' : run.status === 'failed' ? 'error' : run.status === 'running' ? 'active' : 'pending'} />
              </div>
            ))}
            {taskRuns.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">⚡</span>
                </div>
                <p className="text-gray-400">No recent WALLe task runs</p>
                <p className="text-sm text-gray-500 mt-2">
                  TASK automation history will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

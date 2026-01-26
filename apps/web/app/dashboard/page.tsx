"use client";
import { Card, KpiCard, Skeleton, StatusPill } from "@task/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActivityListItem } from "../components/shared/ActivityListItem";
import { useDashboardStore } from "../lib/store";
import type { ActivityEvent } from "../lib/ws";
import { connectActivity } from "../lib/ws";

// Helper for displaying change in KPI
const ChangeIndicator = ({ value }: { value: number }) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  const color = isPositive ? "text-green-500" : "text-red-500";
  const icon = isPositive ? "▲" : "▼";

  // Mock value for visualization until real daily change data is implemented
  const mockChange = Math.random() * 5 * (isPositive ? 1 : -1);

  return (
    <span className={`text-xs ml-2 ${color} font-mono flex items-center`}>
      {icon} {Math.abs(mockChange).toFixed(2)}% (24h)
    </span>
  );
};

interface DashboardStats {
  activeBots: number;
  dailyPnL: number;
  successRate: number;
  taskRuns: number;
  totalBots: number;
  totalValue: number;
}
interface SystemHealth {
  api: "healthy" | "degraded" | "down";
  database: "healthy" | "degraded" | "down";
  websocket: "connected" | "disconnected";
  worker: "healthy" | "degraded" | "down";
}

export default function DashboardPage() {
  const { stats, health, loading, error, refresh } = useDashboardStore();
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [wsStatus, setWsStatus] = useState<"connected" | "disconnected">(
    "disconnected",
  );
  const [liveStats, setLiveStats] = useState<Partial<DashboardStats>>({});

  useEffect(() => {
    refresh(); // Initial static load

    // REMOVED: Polling interval (replaced by WS streaming for efficiency)

    const disconnect = connectActivity({
      onEvent: (evt) => {
        setActivity((prev) => [evt, ...prev].slice(0, 50));

        // Listen for live dashboard stat updates (simulated event type 'stats.update')
        if (
          evt.type === "system" &&
          evt.message === "stats.update" &&
          evt.payload
        ) {
          const updatedStats = JSON.parse(evt.payload as string);
          setLiveStats((prev) => ({ ...prev, ...updatedStats }));
        }
      },
      onStatusChange: (s) => setWsStatus(s),
    });

    // Cleanup only includes WS disconnect now
    return () => {
      disconnect();
    };
  }, [refresh]);

  // Combine static initial stats with live updates
  const currentStats = { ...stats, ...liveStats };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0f19] text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-700 rounded" />
            </div>
            <div className="h-5 w-24 bg-gray-700 rounded" />
          </div>

          <Card className="p-6 bg-[#171c26] border border-blue-500/20">
            <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-10" rounded="md" />
              <Skeleton className="h-10" rounded="md" />
              <Skeleton className="h-10" rounded="md" />
              <Skeleton className="h-10" rounded="md" />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
          </div>

          <Card className="p-6 bg-[#171c26] border border-blue-500/20">
            <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
            <Skeleton className="h-32" rounded="xl" />
          </Card>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">
            Error loading dashboard
          </div>
          <div className="text-gray-400 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
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
            <h1 className="text-3xl font-bold text-yellow-400">Dashboard</h1>
            <p className="text-gray-400">
              System overview and real-time analytics
            </p>
          </div>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* System Health (Themed) */}
        <div className="mb-8 p-6 bg-[#171c26] rounded-lg border border-gray-700/50 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            System Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(health).map(([service, status]) => (
              <div
                key={service}
                className="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-700"
              >
                <span className="capitalize text-gray-300">{service}</span>
                <StatusPill status={status as any} />
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics (Themed with Change Indicators) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <KpiCard
            title="Total Bots"
            value={currentStats.totalBots}
            accent="blue"
            hint="All registered bots"
            className="bg-[#171c26] border border-blue-500/20"
          />
          <KpiCard
            title="Active Bots"
            value={currentStats.activeBots}
            accent="green"
            hint="Currently running"
            className="bg-[#171c26] border border-blue-500/20"
          />
          <KpiCard
            title="Portfolio Value"
            value={`$${currentStats.totalValue.toFixed(2)}`}
            accent="yellow"
            hint="Total assets"
            className="bg-[#171c26] border border-blue-500/20 text-yellow-400"
          />
          <KpiCard
            title="Daily P&L"
            value={`${currentStats.dailyPnL >= 0 ? "+" : ""}${currentStats.dailyPnL.toFixed(2)}`}
            accent={currentStats.dailyPnL >= 0 ? "green" : "red"}
            hint="Realized today"
            className="bg-[#171c26] border border-blue-500/20"
          />
          <KpiCard
            title="Task Runs"
            value={currentStats.taskRuns}
            accent="purple"
            hint="Automations executed"
            className="bg-[#171c26] border border-blue-500/20"
          />
          <KpiCard
            title="Success Rate"
            value={`${currentStats.successRate}%`}
            accent="cyan"
            hint="Last 24h"
            className="bg-[#171c26] border border-blue-500/20"
          />
        </div>

        {/* Quick Actions (Themed) */}
        <div className="mb-8 p-6 bg-[#171c26] rounded-lg border border-gray-700/50 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/bots"
              className="p-4 bg-gray-900 border border-yellow-400/30 hover:bg-yellow-400/20 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2 text-yellow-400">🤖</div>
              <div className="font-medium text-white">Manage Bots</div>
            </Link>
            <Link
              href="/tasks"
              className="p-4 bg-gray-900 border border-yellow-400/30 hover:bg-yellow-400/20 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2 text-yellow-400">⚡</div>
              <div className="font-medium text-white">TASK Studio</div>
            </Link>
            <Link
              href="/markets"
              className="p-4 bg-gray-900 border border-yellow-400/30 hover:bg-yellow-400/20 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2 text-yellow-400">📈</div>
              <div className="font-medium text-white">View Markets</div>
            </Link>
            <Link
              href="/portfolio"
              className="p-4 bg-gray-900 border border-yellow-400/30 hover:bg-yellow-400/20 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2 text-yellow-400">💰</div>
              <div className="font-medium text-white">Portfolio</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity (Componentized and Themed) */}
        <div className="bg-[#171c26] rounded-lg p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-400">
              Recent Activity
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>WebSocket:</span>
              <StatusPill status={wsStatus} />
            </div>
          </div>
          {activity.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Waiting for live events...
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-scroll pr-2">
              {activity.map((evt, idx) => (
                <ActivityListItem key={idx} evt={evt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

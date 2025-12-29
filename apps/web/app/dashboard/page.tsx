"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { KpiCard, StatusPill, Card, Skeleton, Button } from "@task/ui";
import { useDashboardStore } from "../lib/store";
import { connectActivity } from "../lib/ws";
import type { ActivityEvent } from "../lib/ws";

interface DashboardStats {
  totalBots: number;
  activeBots: number;
  totalValue: number;
  dailyPnL: number;
  taskRuns: number;
  successRate: number;
}

interface SystemHealth {
  api: "healthy" | "degraded" | "down";
  database: "healthy" | "degraded" | "down";
  worker: "healthy" | "degraded" | "down";
  websocket: "connected" | "disconnected";
}

export default function DashboardPage() {
  const { stats, health, loading, error, refresh } = useDashboardStore()
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected'>('disconnected')

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30000)
    const disconnect = connectActivity({
      onEvent: (evt) => setActivity((prev) => [evt, ...prev].slice(0, 50)),
      onStatusChange: (s) => setWsStatus(s),
    })
    return () => { clearInterval(interval); disconnect(); }
  }, [refresh])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-700 rounded" />
            </div>
            <div className="h-5 w-24 bg-gray-700 rounded" />
          </div>

          <Card className="p-6">
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

          <Card className="p-6">
            <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
            <Skeleton className="h-32" rounded="xl" />
          </Card>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">System overview and analytics</p>
          </div>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>

        {/* System Health */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(health).map(([service, status]) => (
              <div
                key={service}
                className="flex items-center justify-between p-3 bg-gray-700 rounded"
              >
                <span className="capitalize">{service}</span>
                <StatusPill status={status as any} />
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <KpiCard title="Total Bots" value={stats.totalBots} accent="blue" hint="All bots in system" />
          <KpiCard title="Active Bots" value={stats.activeBots} accent="green" hint="Currently running" />
          <KpiCard title="Portfolio Value" value={`${stats.totalValue.toFixed(2)}`} accent="yellow" hint="Total assets" />
          <KpiCard title="Daily P&L" value={`${stats.dailyPnL >= 0 ? '+' : ''}${stats.dailyPnL.toFixed(2)}`} accent={stats.dailyPnL >= 0 ? 'green' : 'red'} hint="Realized today" />
          <KpiCard title="Task Runs" value={stats.taskRuns} accent="purple" hint="Automations executed" />
          <KpiCard title="Success Rate" value={`${stats.successRate}%`} accent="cyan" hint="Last 24h" />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/bots"
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium">Manage Bots</div>
              </Link>
              <Link
              href="/tasks"
              className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-center transition-colors"
              >
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">TASK Studio</div>
              </Link>
            <Link
              href="/markets"
              className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium">View Markets</div>
            </Link>
            <Link
              href="/portfolio"
              className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium">Portfolio</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
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
            <div className="space-y-2 max-h-80 overflow-auto pr-2">
              {activity.map((evt, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <StatusPill status={(evt.level === 'error' ? 'down' : evt.level === 'warn' ? 'degraded' : 'active') as any} />
                    <div>
                      <div className="text-sm"><span className="uppercase text-gray-400 mr-2">{evt.type}</span>{evt.message}</div>
                      {evt.ts && (
                        <div className="text-xs text-gray-500 mt-1">{new Date(Number(evt.ts)).toLocaleTimeString()}</div>
                      )}
                    </div>
                  </div>
                  {evt.payload && (
                    <span className="text-xs text-gray-500">{typeof evt.payload === 'string' ? evt.payload : ''}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

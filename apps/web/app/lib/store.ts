import { create } from 'zustand'
import { Api, Bot, PnlSnapshot } from './api'
import { connectActivity, WsStatus } from './ws'

export type HealthStatus = 'healthy' | 'degraded' | 'down'


export interface DashboardStats {
  totalBots: number
  activeBots: number
  totalValue: number
  dailyPnL: number
  taskRuns: number
  successRate: number
}

interface DashboardState {
  loading: boolean
  error?: string
  health: { api: HealthStatus; database: HealthStatus; worker: HealthStatus; websocket: WsStatus }
  stats: DashboardStats
  bots: Bot[]
  pnl: PnlSnapshot[]
  marketData: Record<string, { price: number; timestamp: number }>
  activityFeed: Array<{ type: string; message: string; timestamp: number }>
  refresh: () => Promise<void>
  updateMarketData: (symbol: string, price: number, timestamp: number) => void
  addActivity: (activity: { type: string; message: string }) => void
  setWebSocketStatus: (status: WsStatus) => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  loading: true,
  error: undefined,
  health: { api: 'healthy', database: 'healthy', worker: 'healthy', websocket: 'connected' },
  stats: { totalBots: 0, activeBots: 0, totalValue: 0, dailyPnL: 0, taskRuns: 0, successRate: 0 },
  bots: [],
  pnl: [],
  marketData: {},
  activityFeed: [],
  refresh: async () => {
    try {
      set({ loading: true, error: undefined })
      const [bots, pnl] = await Promise.all([
        Api.bots.list(),
        Api.pnl.snapshots('1d'),
      ])
      const totalValue = pnl.reduce((sum, s) => sum + Number(s.totalValue || 0), 0)
      const dailyPnL = pnl.reduce((sum, s) => sum + Number(s.realizedPnl || 0), 0)
      set({
        bots,
        pnl,
        stats: {
          totalBots: bots.length,
          activeBots: bots.filter(b => b.active).length,
          totalValue,
          dailyPnL,
          taskRuns: 42,
          successRate: 95.2,
        },
        health: { ...get().health, api: 'healthy' },
        loading: false,
      })
    } catch (e: any) {
      set({ error: e?.message || 'Unknown error', health: { ...get().health, api: 'down' }, loading: false })
    }
  },
  updateMarketData: (symbol: string, price: number, timestamp: number) => {
    set(state => ({
      marketData: {
        ...state.marketData,
        [symbol]: { price, timestamp }
      }
    }))
  },
  addActivity: (activity: { type: string; message: string }) => {
    set(state => ({
      activityFeed: [
        { ...activity, timestamp: Date.now() },
        ...state.activityFeed.slice(0, 49) // Keep last 50 activities
      ]
    }))
  },
  setWebSocketStatus: (status: WsStatus) => {
    set(state => ({
      health: {
        ...state.health,
        websocket: status
      }
    }))
  },
}))

import { create } from 'zustand'
import { Api, Bot, PnlSnapshot } from './api'

export type HealthStatus = 'healthy' | 'degraded' | 'down'
export type WsStatus = 'connected' | 'disconnected'

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
  refresh: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  loading: true,
  error: undefined,
  health: { api: 'healthy', database: 'healthy', worker: 'healthy', websocket: 'connected' },
  stats: { totalBots: 0, activeBots: 0, totalValue: 0, dailyPnL: 0, taskRuns: 0, successRate: 0 },
  bots: [],
  pnl: [],
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
}))

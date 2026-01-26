import { create } from "zustand";
import { Api, Bot, TaskRun } from "./api";

interface DashboardStore {
  // Loading state
  loading: boolean;

  // Bots data
  bots: Bot[];

  // Stats data
  stats: {
    totalBots: number;
    activeBots: number;
    totalValue: number;
    dailyPnL: number;
    taskRuns: number;
    successRate: number;
    totalValueChange?: number;
    dailyPnLChange?: number;
  };

  // Error state
  error: string | null;

  // System health
  health: {
    api: "healthy" | "degraded" | "down";
    database: "healthy" | "degraded" | "down";
    worker: "healthy" | "degraded" | "down";
    websocket: "connected" | "disconnected";
  };

  // Task runs
  taskRuns: TaskRun[];

  // WebSocket status
  websocketStatus: "connected" | "disconnected" | "connecting";

  // Market data for charts
  marketData: Map<string, { price: number; timestamp: number }>;

  // Recent activities
  activities: Array<{ type: string; message: string; timestamp: number }>;

  // Actions
  refresh: () => Promise<void>;
  updateMarketData: (symbol: string, price: number, timestamp: number) => void;
  addActivity: (activity: { type: string; message: string }) => void;
  setWebSocketStatus: (
    status: "connected" | "disconnected" | "connecting",
  ) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  loading: true,
  bots: [],
  stats: {
    totalBots: 0,
    activeBots: 0,
    totalValue: 0,
    dailyPnL: 0,
    taskRuns: 0,
    successRate: 0,
    totalValueChange: 2.5,
    dailyPnLChange: 150,
  },
  error: null,
  health: {
    api: "healthy",
    database: "healthy",
    worker: "healthy",
    websocket: "disconnected",
  },
  taskRuns: [],
  websocketStatus: "disconnected",
  marketData: new Map(),
  activities: [],

  refresh: async () => {
    set({ loading: true });
    try {
      const [bots, taskRuns] = await Promise.all([
        Api.bots.list(),
        Api.tasks.recentRuns(10),
      ]);

      const activeBots = bots.filter((bot) => bot.active).length;
      const totalValue = 100000; // Placeholder - should come from API
      const dailyPnL = 2500; // Placeholder - should come from API
      const successRate = 95.5; // Placeholder - should come from API
      const totalValueChange = 2.5; // Placeholder - should come from API
      const dailyPnLChange = 150; // Placeholder - should come from API

      set({
        bots,
        stats: {
          totalBots: bots.length,
          activeBots,
          totalValue,
          dailyPnL,
          taskRuns: taskRuns.length,
          successRate,
          totalValueChange,
          dailyPnLChange,
        },
        taskRuns,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data",
      });
    }
  },

  updateMarketData: (symbol, price, timestamp) => {
    set((state) => {
      const newMarketData = new Map(state.marketData);
      newMarketData.set(symbol, { price, timestamp });
      return { marketData: newMarketData };
    });
  },

  addActivity: (activity) => {
    set((state) => ({
      activities: [
        { ...activity, timestamp: Date.now() },
        ...state.activities.slice(0, 49), // Keep last 50 activities
      ],
    }));
  },

  setWebSocketStatus: (status) => {
    set({ websocketStatus: status });
    set((state) => ({
      health: {
        ...state.health,
        websocket: status === "connected" ? "connected" : "disconnected",
      },
    }));
  },
}));

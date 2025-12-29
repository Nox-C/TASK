export const API_BASE = 'http://localhost:3001'

export async function fetchJSON<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const { timeoutMs = 10000, ...rest } = init || {}
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(rest.headers || {}),
      },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

// Domain API helpers
export interface Bot { id: string; name: string; active: boolean; strategyId: string; createdAt: string }
export interface PnlSnapshot { totalValue?: number | string; realizedPnl?: number | string; ts?: string }
export interface Strategy { id: string; name: string; description?: string }
export interface TaskTrigger { id?: string; type: 'cron' | 'webhook'; config: any }
export interface TaskAction { id?: string; type: 'bot.start' | 'bot.stop' | 'notify'; config: any }
export interface Task { id: string; name: string; triggers: TaskTrigger[]; actions: TaskAction[]; createdAt: string }
export interface TaskRun { id: string; taskId: string; status: 'enqueued' | 'running' | 'completed' | 'failed'; startedAt: string; finishedAt?: string }

export const Api = {
  bots: {
    list: () => fetchJSON<Bot[]>(`/bots`),
    create: (body: { name: string; strategyId: string }) =>
      fetchJSON(`/bots`, { method: "POST", body: JSON.stringify(body) }),
    start: (id: string) =>
      fetchJSON<void>(`/bots/${id}/start`, { method: "POST" }),
    stop: (id: string) =>
      fetchJSON<void>(`/bots/${id}/stop`, { method: "POST" }),
  },
  strategies: {
    list: () => fetchJSON<Strategy[]>(`/strategies`),
  },
  pnl: {
    snapshots: (range?: string) =>
      fetchJSON<PnlSnapshot[]>(
        `/pnl/snapshots${range ? `?range=${encodeURIComponent(range)}` : ""}`
      ),
  },
  tasks: {
    list: (ownerId?: string) =>
      fetchJSON<Task[]>(`/tasks${ownerId ? `?ownerId=${ownerId}` : ""}`),
    create: (body: {
      name: string;
      triggers: TaskTrigger[];
      actions: TaskAction[];
      ownerId?: string;
    }) => fetchJSON(`/tasks`, { method: "POST", body: JSON.stringify(body) }),
    run: (id: string, actorId?: string) =>
      fetchJSON<TaskRun>(`/tasks/${id}/run${actorId ? `?actorId=${actorId}` : ""}`, { method: "POST" }),
  },
  backtest: {
    run: (body: {
      symbol: string;
      fromTs?: string;
      toTs?: string;
      delayMs?: number;
      rules?: Array<{
        symbol: string;
        type: "buy_below" | "sell_above";
        threshold: string;
        qty: number;
      }>;
      persist?: boolean;
      startBalances?: Array<{ asset: string; amount: number }>;
      startPositions?: Array<{
        symbol: string;
        qty: number;
        avgPrice?: number;
      }>;
    }) =>
      fetchJSON(`/backtest/run`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    report: (id: string) => fetchJSON(`/backtest/${id}/report`),
    metrics: (id: string) => fetchJSON(`/backtest/${id}/metrics`),
    exportCsv: (id: string) => fetchJSON(`/backtest/${id}/export.csv`),
  },
  health: {
    get: () =>
      Promise.resolve({
        api: "healthy",
        database: "healthy",
        worker: "healthy",
        websocket: "connected" as const,
      }),
  },
};

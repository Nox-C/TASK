import { io, Socket } from "socket.io-client";

export type WsStatus = "connected" | "disconnected";

export type ActivityEvent = {
  type: "bot" | "task" | "market" | "system" | string;
  level?: "info" | "warn" | "error" | "success";
  message: string;
  ts?: string | number;
  payload?: any;
};

let socket: Socket | null = null;
let listeners = 0;

export function connectActivity(opts: {
  onEvent: (evt: ActivityEvent) => void;
  onStatusChange?: (s: WsStatus) => void;
}) {
  if (!socket) {
    // Use HTTP for development, WS for production
    const isDev = process.env.NODE_ENV === "development";
    const wsUrl = isDev
      ? process.env.NEXT_PUBLIC_WS_URL_INSECURE || "ws://localhost:3001"
      : process.env.NEXT_PUBLIC_WS_URL || "wss://localhost:3001";

    console.log(`Connecting to WebSocket: ${wsUrl} (dev: ${isDev})`);

    socket = io(wsUrl, {
      transports: isDev ? ["websocket", "polling"] : ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
    });

    socket.on("connect", () => {
      console.log("WebSocket connected to:", wsUrl);
      opts.onStatusChange?.("connected");
    });
    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      opts.onStatusChange?.("disconnected");
    });
    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      opts.onStatusChange?.("disconnected");
    });
    socket.on("reconnect", (attemptNumber) => {
      console.log("WebSocket reconnected after", attemptNumber, "attempts");
    });
    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("WebSocket reconnection attempt:", attemptNumber);
    });

    const forward = (type: ActivityEvent["type"]) => (data: any) => {
      const evt: ActivityEvent = {
        type,
        message: typeof data === "string" ? data : data?.message || type,
        payload: data,
        ts: Date.now(),
      };
      opts.onEvent(evt);
    };

    socket.on("activity", forward("system"));
    socket.on("bot_event", forward("bot"));
    socket.on("task_event", forward("task"));
    socket.on("market_event", forward("market"));
    socket.on("chart_data", (data: any) => {
      // Forward chart data as market event with special payload
      const evt: ActivityEvent = {
        type: "chart",
        message: `Chart update for ${data.symbol}`,
        payload: data,
        ts: Date.now(),
      };
      opts.onEvent(evt);
    });
  }

  listeners += 1;

  return () => {
    listeners = Math.max(0, listeners - 1);
    if (listeners === 0 && socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
  };
}

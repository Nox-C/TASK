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
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";

    socket = io(wsUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      opts.onStatusChange?.("connected");
    });
    socket.on("disconnect", () => {
      opts.onStatusChange?.("disconnected");
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

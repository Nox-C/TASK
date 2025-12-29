// WebSocket event contracts
export interface MarketPriceEvent {
  type: 'market.price';
  symbol: string;
  price: number;
  timestamp: number;
}

export interface BotStatusEvent {
  type: 'bot.status';
  botId: string;
  status: 'active' | 'inactive' | 'error';
  timestamp: number;
}

export interface TaskRunEvent {
  type: 'task.run';
  taskId: string;
  runId: string;
  status: 'enqueued' | 'running' | 'completed' | 'failed';
  timestamp: number;
}

export interface AuditEvent {
  type: 'audit.event';
  actorId: string | null;
  actorType: string | null;
  action: string;
  details?: any;
  timestamp: number;
}

export type WebSocketEvent = MarketPriceEvent | BotStatusEvent | TaskRunEvent | AuditEvent;
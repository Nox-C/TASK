export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
}

export enum OrderStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled'
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit'
}

export enum BotStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error'
}

export enum TaskTriggerType {
  CRON = 'cron',
  WEBHOOK = 'webhook'
}

export enum TaskActionType {
  BOT_START = 'bot.start',
  BOT_STOP = 'bot.stop',
  NOTIFY = 'notify'
}

export enum TaskRunStatus {
  ENQUEUED = 'enqueued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum VenueType {
  PAPER = 'paper',
  CEX = 'cex',
  DEX = 'dex'
}
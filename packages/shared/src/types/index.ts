export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash?: string;
  createdAt: Date;
}

export interface Bot {
  id: string;
  name: string;
  ownerId: string;
  strategyId: string;
  active: boolean;
  createdAt: Date;
}

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  accountId: string;
  symbol: string;
  side: string;
  qty: number;
  price?: number;
  status: string;
  createdAt: Date;
}

export interface Position {
  id: string;
  accountId: string;
  symbol: string;
  qty: number;
  avgPrice: number;
}

export interface Balance {
  id: string;
  accountId: string;
  asset: string;
  amount: number;
}

export interface Account {
  id: string;
  ownerId: string;
  name: string;
  isBacktest: boolean;
  createdAt: Date;
}

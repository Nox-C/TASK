'use client';

import { create } from 'zustand';
import { BacktestResult, GridBot, PriceData } from '../types/trading';

// ==================== PRICE DATA SLICE ====================
interface PriceSlice {
  prices: Record<string, PriceData>;
  isConnected: boolean;
  setPrice: (symbol: string, priceData: PriceData) => void;
  setPrices: (prices: Record<string, PriceData>) => void;
  setConnectionStatus: (isConnected: boolean) => void;
  getPrice: (symbol: string) => PriceData | undefined;
}

const createPriceSlice = (set: any, get: any): PriceSlice => ({
  prices: {}, // STRICT: Must be empty initially
  isConnected: false,

  setPrice: (symbol: string, priceData: PriceData) =>
    set((state: any) => ({
      prices: { 
        ...state.prices, 
        [symbol]: priceData 
      }
    })),

  setPrices: (prices: Record<string, PriceData>) =>
    set({ prices }),

  setConnectionStatus: (isConnected: boolean) =>
    set({ isConnected }),

  getPrice: (symbol: string) => {
    const state = get();
    return state.prices[symbol];
  }
});

// ==================== ACTIVE BOT SLICE ====================
interface ActiveBotSlice {
  activeBot: GridBot | null;
  backtestResults: BacktestResult[];
  globalError: boolean; // New State for EVE-red-eye
  setActiveBot: (bot: GridBot | null) => void;
  updateGridLevels: (levels: any[]) => void;
  updateGridParams: (params: Partial<GridBot>) => void;
  addBacktestResult: (result: BacktestResult) => void;
  getBacktestResults: (botId?: string) => BacktestResult[];
  setGlobalError: (status: boolean) => void; // New Action
}

const createActiveBotSlice = (set: any, get: any): ActiveBotSlice => ({
  activeBot: null, // STRICT: Must be null initially
  backtestResults: [],
  globalError: false, // EVE-red-eye state

  setActiveBot: (bot: GridBot | null) =>
    set({ activeBot: bot }),

  updateGridLevels: (levels: any[]) =>
    set((state: any) => ({
      activeBot: state.activeBot 
        ? { ...state.activeBot, levels, updatedAt: new Date().toISOString() }
        : null
    })),

  updateGridParams: (params: Partial<GridBot>) =>
    set((state: any) => ({
      activeBot: state.activeBot 
        ? { ...state.activeBot, ...params, updatedAt: new Date().toISOString() }
        : null
    })),

  addBacktestResult: (result: BacktestResult) =>
    set((state: any) => ({
      backtestResults: [...state.backtestResults, result]
    })),

  getBacktestResults: (botId?: string) => {
    const state = get();
    if (botId) {
      return state.backtestResults.filter((result: BacktestResult) => result.botId === botId);
    }
    return state.backtestResults;
  },

  setGlobalError: (status: boolean) => set({ globalError: status }), // EVE-red-eye trigger
});

// ==================== MAIN STORE ====================
interface TradeState extends PriceSlice, ActiveBotSlice {}

export const useTradeStore = create<TradeState>((set, get) => ({
  // Price slice
  ...createPriceSlice(set, get),
  
  // Active bot slice  
  ...createActiveBotSlice(set, get),
}));

// ==================== HIGH-PERFORMANCE SELECTORS ====================
// Use these selectors to prevent unnecessary re-renders

// Price selectors - component only re-renders when specific symbol price changes
export const usePrice = (symbol: string) => 
  useTradeStore((state) => state.prices[symbol]);

export const useAllPrices = () => 
  useTradeStore((state) => state.prices);

export const useGlobalError = () => useTradeStore((state) => state.globalError); // New selector

export const useConnectionStatus = () => 
  useTradeStore((state) => state.isConnected);

// Active bot selectors - component only re-renders when specific bot data changes
export const useActiveBot = () => 
  useTradeStore((state) => state.activeBot);

export const useGridLevels = () => 
  useTradeStore((state) => state.activeBot?.levels);

export const useBacktestResults = (botId?: string) => 
  useTradeStore((state) => {
    if (botId) {
      return state.backtestResults.filter(result => result.botId === botId);
    }
    return state.backtestResults;
  });

// Action selectors - for accessing actions without triggering re-renders
export const useTradeActions = () => 
  useTradeStore((state) => ({
    setPrice: state.setPrice,
    setPrices: state.setPrices,
    setConnectionStatus: state.setConnectionStatus,
    getPrice: state.getPrice,
    setActiveBot: state.setActiveBot,
    updateGridLevels: state.updateGridLevels,
    updateGridParams: state.updateGridParams,
    addBacktestResult: state.addBacktestResult,
    getBacktestResults: state.getBacktestResults,
  }));

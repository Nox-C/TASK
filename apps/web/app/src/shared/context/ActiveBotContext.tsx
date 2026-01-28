'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { BacktestResult, GridBot, PriceData } from '../types/trading';
import { usePriceFeed } from './PriceFeedContext';

interface ActiveBotContextType {
  activeBot: GridBot | null;        // Currently selected or being-built bot
  prices: Record<string, PriceData>;   // Live prices from PriceFeedContext (single source)
  backtestResults: BacktestResult[];
  setActiveBot: (bot: GridBot | null) => void;
  updateGridParams: (params: Partial<GridBot>) => void;
  addBacktestResult: (result: BacktestResult) => void;
  getBacktestResults: (botId?: string) => BacktestResult[];
}

const ActiveBotContext = createContext<ActiveBotContextType | undefined>(undefined);

export function ActiveBotProvider({ children }: { children: ReactNode }) {
  const [activeBot, setActiveBotState] = useState<GridBot | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const { prices } = usePriceFeed(); // Single source of truth for price data

  const setActiveBot = (bot: GridBot | null) => {
    setActiveBotState(bot);
  };

  const updateGridParams = (params: Partial<GridBot>) => {
    if (activeBot) {
      const updatedBot = { ...activeBot, ...params, updatedAt: new Date().toISOString() };
      setActiveBotState(updatedBot);
    }
  };

  const addBacktestResult = (result: BacktestResult) => {
    setBacktestResults(prev => [...prev, result]);
  };

  const getBacktestResults = (botId?: string) => {
    if (botId) {
      return backtestResults.filter(result => result.botId === botId);
    }
    return backtestResults;
  };

  return (
    <ActiveBotContext.Provider value={{
      activeBot,
      prices, // Single source of truth from PriceFeedContext
      backtestResults,
      setActiveBot,
      updateGridParams,
      addBacktestResult,
      getBacktestResults
    }}>
      {children}
    </ActiveBotContext.Provider>
  );
}

export function useActiveBot() {
  const context = useContext(ActiveBotContext);
  if (!context) {
    throw new Error('useActiveBot must be used within an ActiveBotProvider');
  }
  return context;
}

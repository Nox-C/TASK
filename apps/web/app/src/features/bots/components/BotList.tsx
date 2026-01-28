'use client';

import { useState } from 'react';
import { useActiveBot } from '../../../shared/context/ActiveBotContext';
import { usePrice } from '../../../shared/hooks/usePrice';
import { GridBot } from '../../../shared/types/trading';

export function BotList() {
  const { activeBot, setActiveBot, getBacktestResults } = useActiveBot();
  const [showBacktest, setShowBacktest] = useState(false);

  // Mock bot data - in real app this would come from API
  const bots: GridBot[] = [
    {
      id: '1',
      name: 'WALL-E Grid Bot',
      symbol: 'BTC/USDT',
      strategy: 'Grid Trading',
      upperPrice: 50000,
      lowerPrice: 40000,
      gridCount: 10,
      levels: Array.from({ length: 10 }, (_, i) => ({
        price: 40000 + (i * 1000),
        type: i % 2 === 0 ? 'BUY' : 'SELL',
        status: Math.random() > 0.5 ? 'FILLED' : 'PENDING'
      })),
      isActive: true,
      status: 'RUNNING',
      totalPnl: 125.50,
      positionSize: 10,
      stopLoss: 2,
      takeProfit: 5,
      exchange: 'binance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'EVE DCA Bot',
      symbol: 'ETH/USDT',
      strategy: 'Dollar Cost Averaging',
      upperPrice: 3500,
      lowerPrice: 2500,
      gridCount: 5,
      levels: Array.from({ length: 5 }, (_, i) => ({
        price: 2500 + (i * 200),
        type: 'BUY',
        status: Math.random() > 0.5 ? 'FILLED' : 'PENDING'
      })),
      isActive: false,
      status: 'STOPPED',
      totalPnl: -45.20,
      positionSize: 5,
      stopLoss: 3,
      takeProfit: 8,
      exchange: 'coinbase',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const handleBotClick = (bot: GridBot) => {
    setActiveBot(bot);
  };

  const handleStartStop = (bot: GridBot) => {
    // In real app, would call API to start/stop bot
    console.log(`${bot.status === 'RUNNING' ? 'Stop' : 'Start'} bot: ${bot.name}`);
  };

  const handleDelete = (botId: string) => {
    // In real app, would call API to delete bot
    console.log(`Delete bot: ${botId}`);
  };

  const handleBacktest = (botId: string) => {
    // In real app, would call API to run backtest
    console.log(`Run backtest for bot: ${botId}`);
  };

  return (
    <div className="bg-walle-surface rounded-xl border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-walle-yellow">Trading Bots</h2>
        <button
          onClick={() => setShowBacktest(!showBacktest)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
        >
          {showBacktest ? 'Hide' : 'Show'} Backtesting
        </button>
      </div>
      
      <div className="space-y-4">
        {bots.map((bot) => {
          const priceData = usePrice(bot.symbol);
          const backtestResults = getBacktestResults(bot.id);
          const isSelected = activeBot?.id === bot.id;
          
          return (
            <div
              key={bot.id}
              onClick={() => handleBotClick(bot)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-blue-900/30 border-blue-500' 
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{bot.name}</h3>
                  <p className="text-gray-400 text-sm">{bot.strategy} • {bot.symbol}</p>
                  {priceData && (
                    <p className="text-walle-yellow text-sm font-semibold">
                      Current: ${priceData.price.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    bot.status === 'RUNNING' ? 'bg-green-900 text-green-300' :
                    bot.status === 'STOPPED' ? 'bg-gray-700 text-gray-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {bot.status}
                  </span>
                  <p className={`font-bold mt-1 ${bot.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${bot.totalPnl.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartStop(bot);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    bot.status === 'RUNNING' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {bot.status === 'RUNNING' ? 'Stop' : 'Start'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBacktest(bot.id);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
                >
                  Backtest
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(bot.id);
                  }}
                  className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>

              {isSelected && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-300 mb-2">
                    Grid: {bot.gridCount} levels from ${bot.lowerPrice.toLocaleString()} to ${bot.upperPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-300">
                    Position: {bot.positionSize}% • SL: {bot.stopLoss}% • TP: {bot.takeProfit}%
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showBacktest && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold text-walle-yellow mb-4">Recent Backtest Results</h3>
          <div className="space-y-3">
            {bots.map((bot) => {
              const results = getBacktestResults(bot.id);
              return (
                <div key={bot.id} className="space-y-2">
                  <p className="text-white font-semibold">{bot.name}</p>
                  {results.length > 0 ? (
                    results.map((result) => (
                      <div key={result.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                        <div>
                          <p className="text-gray-400 text-sm">
                            {new Date(result.startDate).toLocaleDateString()} - {new Date(result.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${result.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
                          </p>
                          <p className="text-gray-400 text-sm">
                            Win Rate: {result.winRate.toFixed(1)}% • {result.totalTrades} trades
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No backtest results yet</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { BotList } from './features/bots/components/BotList';
import { GridForm } from './features/bots/components/GridForm';
import { MainChart } from './features/charts/components/MainChart';
import { BnLFooter } from './shared/components/BnLLogo';
import { GlobalStatus } from './shared/components/GlobalStatus';
import { KPICards } from './shared/components/KPICards';
import WallEAnimation from './shared/components/WallEAnimation';
import WallEIcon from './shared/components/WallEIcon';
import { useActiveBot, useAllPrices, useTradeStore } from './shared/store/useTradeStore';

export default function Main() {
  const activeBot = useActiveBot();
  const { prices } = useAllPrices();
  const isConnected = useTradeStore((state: any) => state.isConnected);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');

  // Calculate metrics
  const metrics = {
    totalEquity: 125430,
    totalPnl: 80.30,
    winRate: 65,
    totalBots: 2,
    activeBots: 1
  };

  const handleCreateBot = () => {
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen p-8 bg-bnl-dark">
      {/* Global Status Bar */}
      <GlobalStatus />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <WallEAnimation type="working" size="lg" />
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-walle-yellow via-walle-orange to-walle-lightblue">
              WALL-E Trading Dashboard
            </h1>
            <p className="text-eve-white/70 text-lg">
              Advanced AI-Powered Trading Analytics
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-walle-yellow to-walle-orange text-black font-bold rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <WallEIcon size="sm" />
            Launch Bot
          </button>
          <button
            className="px-6 py-3 bg-white/10 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <WallEAnimation type="working" size="sm" />
            Live Data
          </button>
        </div>
      </div>

      {/* Live Price Ticker */}
      <div className="mb-6 backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-4 mb-2">
          <WallEAnimation type="working" size="sm" />
          <span className="text-white font-semibold">
            {isConnected ? 'Live Data' : 'Connecting...'}
          </span>
        </div>
        <div className="flex gap-8 overflow-x-auto">
          {prices && Object.values(prices).map((price: any) => (
            <div key={price.symbol} className="flex items-center gap-4 whitespace-nowrap">
              <span className="text-gray-400 font-medium">{price.symbol}</span>
              <span className="text-white font-bold text-lg">${price.price.toLocaleString()}</span>
              <span className={`text-sm font-semibold ${price.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <KPICards metrics={metrics} />

      {/* Symbol Selector */}
      <div className="mb-6 flex gap-4">
        {prices && Object.keys(prices).map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedSymbol === symbol
                ? 'bg-walle-yellow text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <WallEAnimation type="happy" size="sm" />
            {activeBot ? `${activeBot.name} - ${activeBot.symbol}` : `${selectedSymbol} Chart`}
          </h3>
          <div className="h-80 bg-white/5 rounded-xl p-4">
            <MainChart symbol={activeBot ? activeBot.symbol : selectedSymbol} />
          </div>
        </div>

        {/* Trading Activity */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <WallEAnimation type="searching" size="sm" />
            Live Activity
          </h3>
          
          <div className="space-y-3">
            {[
              { time: "2 min ago", action: "Buy Order", pair: "BTC/USDT", amount: "$1,250" },
              { time: "5 min ago", action: "Sell Order", pair: "ETH/USDT", amount: "$850" },
              { time: "8 min ago", action: "Grid Trade", pair: "SOL/USDT", amount: "$420" },
              { time: "12 min ago", action: "DCA Purchase", pair: "ADA/USDT", amount: "$200" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <WallEAnimation type="idle" size="sm" />
                  <div>
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-sm">{activity.pair}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{activity.amount}</p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bot Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Bot List */}
        <BotList />

        {/* Grid Form */}
        <GridForm />
      </div>

      {/* Create Bot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-walle-surface rounded-xl p-8 max-w-2xl w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-walle-yellow mb-6">Create New Trading Bot</h2>
            <div className="text-center text-gray-400">
              <p>Use the Grid Form panel to create and configure your bot.</p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="mt-4 px-6 py-3 bg-walle-yellow text-black rounded-lg hover:bg-yellow-500 font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* BnL Footer */}
      <BnLFooter />
    </div>
  );
}

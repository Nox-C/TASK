'use client';

import React, { useState } from 'react';
import { useActiveBot } from '../../../shared/context/ActiveBotContext';
import { GridBot } from '../../../shared/types/trading';

export function GridForm() {
  const { activeBot, updateGridParams, setActiveBot } = useActiveBot();
  const [formData, setFormData] = useState({
    name: '',
    symbol: 'BTC/USDT',
    strategy: 'Grid Trading',
    upperPrice: 50000,
    lowerPrice: 40000,
    gridCount: 10,
    positionSize: 10,
    stopLoss: 2,
    takeProfit: 5,
    exchange: 'binance'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate grid levels
    const levels = Array.from({ length: formData.gridCount }, (_, i) => {
      const price = formData.lowerPrice + (i * (formData.upperPrice - formData.lowerPrice) / (formData.gridCount - 1));
      return {
        price,
        type: i % 2 === 0 ? 'BUY' as const : 'SELL' as const,
        status: 'PENDING' as const
      };
    });

    const newBot: GridBot = {
      id: Date.now().toString(),
      ...formData,
      levels,
      isActive: false,
      status: 'STOPPED',
      totalPnl: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setActiveBot(newBot);
  };

  const handleUpdateGrid = () => {
    if (!activeBot) return;

    // Recalculate grid levels
    const levels = Array.from({ length: activeBot.gridCount }, (_, i) => {
      const price = activeBot.lowerPrice + (i * (activeBot.upperPrice - activeBot.lowerPrice) / (activeBot.gridCount - 1));
      return {
        price,
        type: i % 2 === 0 ? 'BUY' as const : 'SELL' as const,
        status: 'PENDING' as const
      };
    });

    updateGridParams({ levels });
  };

  return (
    <div className="bg-walle-surface rounded-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-walle-yellow mb-6">
        {activeBot ? 'Update Grid Parameters' : 'Create New Grid Bot'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Bot Name</label>
            <input
              type="text"
              value={activeBot ? activeBot.name : formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Enter bot name"
              disabled={!!activeBot}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Symbol</label>
            <select
              value={activeBot ? activeBot.symbol : formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              disabled={!!activeBot}
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
              <option value="ADA/USDT">ADA/USDT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Upper Price</label>
            <input
              type="number"
              value={activeBot ? activeBot.upperPrice : formData.upperPrice}
              onChange={(e) => setFormData({ ...formData, upperPrice: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Lower Price</label>
            <input
              type="number"
              value={activeBot ? activeBot.lowerPrice : formData.lowerPrice}
              onChange={(e) => setFormData({ ...formData, lowerPrice: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Grid Count</label>
            <input
              type="number"
              value={activeBot ? activeBot.gridCount : formData.gridCount}
              onChange={(e) => setFormData({ ...formData, gridCount: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min="2"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Position Size (%)</label>
            <input
              type="number"
              value={activeBot ? activeBot.positionSize : formData.positionSize}
              onChange={(e) => setFormData({ ...formData, positionSize: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Stop Loss (%)</label>
            <input
              type="number"
              value={activeBot ? activeBot.stopLoss : formData.stopLoss}
              onChange={(e) => setFormData({ ...formData, stopLoss: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min="0.1"
              max="50"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Take Profit (%)</label>
            <input
              type="number"
              value={activeBot ? activeBot.takeProfit : formData.takeProfit}
              onChange={(e) => setFormData({ ...formData, takeProfit: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min="0.1"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="flex gap-4">
          {activeBot ? (
            <>
              <button
                type="button"
                onClick={handleUpdateGrid}
                className="flex-1 px-6 py-3 bg-walle-yellow text-black rounded-lg hover:bg-yellow-500 font-semibold"
              >
                Update Grid
              </button>
              <button
                type="button"
                onClick={() => setActiveBot(null)}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-semibold"
              >
                Clear
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveBot(null)}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-walle-yellow text-black rounded-lg hover:bg-yellow-500 font-semibold"
              >
                Create Bot
              </button>
            </>
          )}
        </div>
      </form>

      {activeBot && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold text-walle-yellow mb-3">Grid Preview</h3>
          <div className="space-y-2">
            {activeBot.levels.slice(0, 5).map((level, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className={`text-sm font-semibold ${level.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                  {level.type}
                </span>
                <span className="text-white">${level.price.toFixed(2)}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  level.status === 'FILLED' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                }`}>
                  {level.status}
                </span>
              </div>
            ))}
            {activeBot.levels.length > 5 && (
              <p className="text-gray-500 text-sm text-center">... and {activeBot.levels.length - 5} more levels</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

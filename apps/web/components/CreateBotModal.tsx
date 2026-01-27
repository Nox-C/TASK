import { useState } from 'react';

export function CreateBotModal({ onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    name: '',
    strategy: 'RSI_REVERSAL',
    exchange: 'binance',
    tradingPair: 'BTC/USDT',
    positionSize: 10,
    stopLoss: 2,
    takeProfit: 5,
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-walle-surface rounded-xl p-8 max-w-2xl w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-walle-yellow mb-6">Create New Trading Bot</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bot Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Strategy</label>
              <select
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="RSI_REVERSAL">RSI Reversal</option>
                <option value="MACD_CROSS">MACD Cross</option>
                <option value="GRID_TRADING">Grid Trading</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Exchange</label>
              <select
                value={formData.exchange}
                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="binance">Binance</option>
                <option value="coinbase">Coinbase</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Trading Pair</label>
              <input
                type="text"
                value={formData.tradingPair}
                onChange={(e) => setFormData({ ...formData, tradingPair: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Position Size (%)</label>
              <input
                type="number"
                value={formData.positionSize}
                onChange={(e) => setFormData({ ...formData, positionSize: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Stop Loss (%)</label>
              <input
                type="number"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
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
          </div>
        </form>
      </div>
    </div>
  );
}

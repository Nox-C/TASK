export function KPICards({ metrics }: any) {
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      <div className="bg-walle-surface p-6 rounded-xl border border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Total Bots</p>
            <p className="text-3xl font-bold text-walle-yellow">{metrics.totalBots}</p>
          </div>
          <img src="/wall-e-icon.png" alt="WALL-E" className="w-12 h-12" />
        </div>
      </div>

      <div className="bg-walle-surface p-6 rounded-xl border border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Active Bots</p>
            <p className="text-3xl font-bold text-green-500">{metrics.activeBots}</p>
          </div>
          <img src="/wall-e-icon.png" alt="WALL-E Active" className="w-12 h-12" />
        </div>
      </div>

      <div className="bg-walle-surface p-6 rounded-xl border border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Total P&L</p>
            <p className={`text-3xl font-bold ${metrics.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${metrics.totalPnl.toFixed(2)}
            </p>
          </div>
          <img src="/wall-e-icon.png" alt="WALL-E Trading" className="w-12 h-12" />
        </div>
      </div>

      <div className="bg-walle-surface p-6 rounded-xl border border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-3xl font-bold text-walle-yellow">{metrics.winRate}%</p>
          </div>
          <img src="/wall-e-icon.png" alt="WALL-E Analytics" className="w-12 h-12" />
        </div>
      </div>
    </div>
  );
}

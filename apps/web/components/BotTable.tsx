export function BotTable({ bots, onStart, onStop, onDelete }: any) {
  return (
    <div className="bg-walle-surface rounded-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-walle-yellow mb-6">Your Trading Bots</h2>
      
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400">Name</th>
            <th className="text-left py-3 px-4 text-gray-400">Strategy</th>
            <th className="text-left py-3 px-4 text-gray-400">Pair</th>
            <th className="text-left py-3 px-4 text-gray-400">Status</th>
            <th className="text-left py-3 px-4 text-gray-400">P&L</th>
            <th className="text-right py-3 px-4 text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bots.map((bot: any) => (
            <tr key={bot.id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="py-4 px-4 font-semibold">{bot.name}</td>
              <td className="py-4 px-4 text-gray-300">{bot.strategy}</td>
              <td className="py-4 px-4 text-gray-300">{bot.tradingPair}</td>
              <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  bot.status === 'RUNNING' ? 'bg-green-900 text-green-300' :
                  bot.status === 'STOPPED' ? 'bg-gray-700 text-gray-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {bot.status}
                </span>
              </td>
              <td className={`py-4 px-4 font-bold ${Number(bot.totalPnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Number(bot.totalPnl).toFixed(2)}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex gap-2 justify-end">
                  {bot.status !== 'RUNNING' ? (
                    <button
                      onClick={() => onStart(bot.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={() => onStop(bot.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                    >
                      Stop
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(bot.id)}
                    className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

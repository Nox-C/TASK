"use client";

interface Position {
  id: string;
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  accountId: string;
}

const formatCurrency = (value: number | string, decimals = 2): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "N/A";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
  });
};

interface PositionCardProps {
  position: Position;
}

export const PositionCard = ({ position }: PositionCardProps) => {
  const marketValue = position.qty * position.currentPrice;
  const percentReturn =
    ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100;

  const pnlColorClass =
    position.unrealizedPnL >= 0 ? "text-green-400" : "text-red-400";
  const pnlPrefix = position.unrealizedPnL >= 0 ? "+" : "";

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-lg font-bold text-yellow-400">
            {position.symbol}
          </div>
          <div className="text-sm text-gray-400 mt-0.5">
            Qty: {position.qty.toLocaleString()} @{" "}
            {formatCurrency(position.avgPrice, 2)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-white">
            {formatCurrency(position.currentPrice, 2)}
          </div>
          <div className={`text-sm mt-0.5 font-bold ${pnlColorClass}`}>
            {pnlPrefix}
            {formatCurrency(position.unrealizedPnL, 2)}
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 border-t border-gray-800 pt-2">
        <span>Market Value: {formatCurrency(marketValue, 2)}</span>
        <span
          className={percentReturn >= 0 ? "text-green-400" : "text-red-400"}
        >
          {percentReturn >= 0 ? "+" : ""}
          {percentReturn.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

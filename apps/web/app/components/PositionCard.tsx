"use client";

interface PositionCardProps {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
}

export function PositionCard({
  symbol,
  quantity,
  averagePrice,
  currentPrice,
  unrealizedPnL,
}: PositionCardProps) {
  const marketValue = quantity * currentPrice;
  const returnPercentage = ((currentPrice - averagePrice) / averagePrice) * 100;
  const isProfitable = unrealizedPnL >= 0;

  return (
    <div className="p-3 bg-gray-700/50 rounded border border-gray-600/50 transition-all hover:bg-gray-700/70">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-gray-200">{symbol}</div>
          <div className="text-sm text-gray-400">
            Qty: {quantity} @ ${averagePrice.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-200">
            ${currentPrice.toLocaleString()}
          </div>
          <div
            className={`text-sm font-medium ${
              isProfitable ? "text-walle-green" : "text-walle-orange"
            }`}
          >
            {isProfitable ? "+" : ""}${unrealizedPnL.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Market Value: ${marketValue.toLocaleString()}</span>
        <span
          className={isProfitable ? "text-walle-green" : "text-walle-orange"}
        >
          Return: {returnPercentage >= 0 ? "+" : ""}
          {returnPercentage.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

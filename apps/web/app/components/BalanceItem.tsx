"use client";

interface BalanceItemProps {
  asset: string;
  amount: number;
  value?: number;
  isUSD?: boolean;
}

export function BalanceItem({
  asset,
  amount,
  value,
  isUSD = false,
}: BalanceItemProps) {
  const getAssetIcon = (asset: string) => {
    return asset.substring(0, 2).toUpperCase();
  };

  const getAssetName = (asset: string) => {
    switch (asset) {
      case "USD":
        return "US Dollar";
      case "BTC":
        return "Bitcoin";
      case "ETH":
        return "Ethereum";
      default:
        return asset;
    }
  };

  const calculateUSDValue = () => {
    if (isUSD) return amount;
    return value || amount * 1000; // Mock calculation for crypto
  };

  const usdValue = calculateUSDValue();

  return (
    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded border border-gray-600/50 transition-all hover:bg-gray-700/70">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-walle-blue rounded-full flex items-center justify-center mr-3 shadow-elevated">
          <span className="text-sm font-bold text-white">
            {getAssetIcon(asset)}
          </span>
        </div>
        <div>
          <div className="font-semibold text-gray-200">{asset}</div>
          <div className="text-sm text-gray-400">{getAssetName(asset)}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-walle-yellow">
          {amount.toLocaleString()} {asset}
        </div>
        <div className="text-sm text-gray-400">
          $
          {usdValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
}

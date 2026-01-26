"use client";

interface Balance {
  id: string;
  asset: string;
  amount: number;
  accountId: string;
}

const formatCurrency = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "N/A";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: num < 10 ? 8 : 2,
  });
};

interface BalanceItemProps {
  balance: Balance;
}

export const BalanceItem = ({ balance }: BalanceItemProps) => {
  const assetValueUSD =
    balance.asset === "USD" ? balance.amount : balance.amount * 1000; // Mock calculation retained

  return (
    <div
      key={balance.id}
      className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-600/80 rounded-full flex items-center justify-center mr-4 shadow-lg">
          <span className="text-sm font-bold text-white">
            {balance.asset.substring(0, 3)}
          </span>
        </div>
        <div>
          <div className="font-semibold text-white">{balance.asset}</div>
          <div className="text-sm text-gray-400">
            {balance.asset === "USD" ? "US Dollar" : "Crypto Asset"}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-yellow-400">
          {balance.amount.toLocaleString(undefined, {
            maximumFractionDigits: balance.amount < 1 ? 8 : 4,
          })}{" "}
          {balance.asset}
        </div>
        <div className="text-sm text-gray-400 mt-0.5">
          ≈ {formatCurrency(assetValueUSD)}
        </div>
      </div>
    </div>
  );
};

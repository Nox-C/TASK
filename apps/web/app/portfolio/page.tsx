'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Api } from '../lib/api';
import { Card, KpiCard, Skeleton, Button } from '@task/ui';

interface Balance {
  id: string;
  asset: string;
  amount: number;
  accountId: string;
}

interface Position {
  id: string;
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  accountId: string;
}

interface PnLSnapshot {
  id: string;
  realizedPnl: number;
  unrealizedPnl: number;
  totalValue: number;
  createdAt: string;
}

export default function PortfolioPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [pnlSnapshots, setPnlSnapshots] = useState<PnLSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('paper-account');

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        // Fetch PnL snapshots
        const pnlData = await Api.pnl.snapshots();
        setPnlSnapshots(pnlData as any);

        // Mock balances and positions for now
        setBalances([
          { id: '1', asset: 'USD', amount: 10000, accountId: 'paper-account' },
          { id: '2', asset: 'BTC', amount: 0.5, accountId: 'paper-account' },
          { id: '3', asset: 'ETH', amount: 2.5, accountId: 'paper-account' }
        ]);

        setPositions([
          {
            id: '1',
            symbol: 'BTC-USD',
            qty: 0.5,
            avgPrice: 42000,
            currentPrice: 45000,
            unrealizedPnL: 1500,
            accountId: 'paper-account'
          },
          {
            id: '2',
            symbol: 'ETH-USD',
            qty: 2.5,
            avgPrice: 3000,
            currentPrice: 3200,
            unrealizedPnL: 500,
            accountId: 'paper-account'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
        setLoading(false);
      }
    };

    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalPortfolioValue = balances.reduce((sum, balance) => {
    if (balance.asset === 'USD') return sum + balance.amount;
    // For crypto assets, we'd multiply by current price
    return sum + (balance.amount * 1000); // Mock calculation
  }, 0);

  const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalRealizedPnL = pnlSnapshots.reduce((sum, snap) => sum + parseFloat(snap.realizedPnl.toString()), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-72 bg-gray-700 rounded" />
            </div>
            <div className="h-9 w-28 bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
          </div>
          <Card className="p-6">
            <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
            <Skeleton className="h-64" rounded="xl" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-gray-400">Account balances and positions</p>
          </div>
          <Link href="/"><Button variant="secondary">Back to Home</Button></Link>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Total Value" value={`${totalPortfolioValue.toLocaleString()}`} accent="blue" hint="Across all assets" />
          <KpiCard title="Unrealized P&L" value={`${totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toLocaleString()}`} accent={totalUnrealizedPnL >= 0 ? 'green' : 'red'} hint="Open positions" />
          <KpiCard title="Realized P&L" value={`${totalRealizedPnL >= 0 ? '+' : ''}${totalRealizedPnL.toFixed(2)}`} accent={totalRealizedPnL >= 0 ? 'green' : 'red'} hint="All time" />
          <KpiCard title="Account Type" value="Paper Trading" accent="yellow" hint="Environment" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balances */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Balances</h2>
            <div className="space-y-3">
              {balances.map(balance => (
                <div key={balance.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">
                        {balance.asset.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{balance.asset}</div>
                      <div className="text-sm text-gray-400">
                        {balance.asset === 'USD' ? 'US Dollar' : balance.asset}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {balance.amount.toLocaleString()} {balance.asset}
                    </div>
                    <div className="text-sm text-gray-400">
                      {balance.asset === 'USD' 
                        ? `$${balance.amount.toLocaleString()}`
                        : `≈ $${(balance.amount * 1000).toLocaleString()}`
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Positions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Open Positions</h2>
            <div className="space-y-3">
              {positions.map(position => (
                <div key={position.id} className="p-3 bg-gray-700 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{position.symbol}</div>
                      <div className="text-sm text-gray-400">
                        Qty: {position.qty} @ ${position.avgPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${position.currentPrice.toLocaleString()}
                      </div>
                      <div className={`text-sm ${
                        position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Market Value: ${(position.qty * position.currentPrice).toLocaleString()}</span>
                    <span>
                      Return: {(((position.currentPrice - position.avgPrice) / position.avgPrice) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
              {positions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No open positions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* P&L History */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">P&L History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Date</th>
                  <th className="text-right py-2">Realized P&L</th>
                  <th className="text-right py-2">Unrealized P&L</th>
                  <th className="text-right py-2">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {pnlSnapshots.slice(0, 10).map(snapshot => (
                  <tr key={snapshot.id} className="border-b border-gray-700">
                    <td className="py-2">
                      {new Date(snapshot.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`text-right py-2 ${
                      parseFloat(snapshot.realizedPnl.toString()) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {parseFloat(snapshot.realizedPnl.toString()) >= 0 ? '+' : ''}${parseFloat(snapshot.realizedPnl.toString()).toFixed(2)}
                    </td>
                    <td className={`text-right py-2 ${
                      parseFloat(snapshot.unrealizedPnl.toString()) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {parseFloat(snapshot.unrealizedPnl.toString()) >= 0 ? '+' : ''}${parseFloat(snapshot.unrealizedPnl.toString()).toFixed(2)}
                    </td>
                    <td className="text-right py-2">
                      ${parseFloat(snapshot.totalValue.toString()).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {pnlSnapshots.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No P&L history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

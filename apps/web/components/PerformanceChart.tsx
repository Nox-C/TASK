'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '00:00', pnl: 0 },
  { time: '04:00', pnl: 150 },
  { time: '08:00', pnl: 280 },
  { time: '12:00', pnl: 220 },
  { time: '16:00', pnl: 450 },
  { time: '20:00', pnl: 520 },
  { time: '24:00', pnl: 680 },
];

export function PerformanceChart() {
  return (
    <div className="bg-walle-surface rounded-xl border border-gray-700 p-6 mb-8">
      <h2 className="text-2xl font-bold text-walle-yellow mb-6">Performance Over Time</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1B2838', border: '1px solid #374151' }}
            labelStyle={{ color: '#FFB800' }}
          />
          <Line type="monotone" dataKey="pnl" stroke="#FFB800" strokeWidth={3} dot={{ fill: '#FFB800' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

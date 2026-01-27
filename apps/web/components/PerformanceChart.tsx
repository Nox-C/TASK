'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '00:00', value: 1000 },
  { time: '04:00', value: 1050 },
  { time: '08:00', value: 1030 },
  { time: '12:00', value: 1100 },
  { time: '16:00', value: 1080 },
  { time: '20:00', value: 1150 },
  { time: '24:00', value: 1200 },
];

export function PerformanceChart() {
  return (
    <div className="bg-walle-surface rounded-xl border border-gray-700 p-6 mb-8">
      <h2 className="text-2xl font-bold text-walle-yellow mb-6">Portfolio Performance</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1B2838', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#FFB800" 
            strokeWidth={2}
            dot={{ fill: '#FFB800' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

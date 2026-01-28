'use client';

import { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useActiveBot } from '../../../shared/context/ActiveBotContext';
import { usePrice } from '../../../shared/hooks/usePrice';
import { GridOverlay } from './GridOverlay';

export function MainChart({ symbol }: { symbol: string }) {
  const priceData = usePrice(symbol);
  const { activeBot } = useActiveBot();
  const [chartInstance, setChartInstance] = useState<any>(null);
  const chartContainerRef = useRef(null);

  // Mock chart API - in real implementation this would be the actual chart library API
  useEffect(() => {
    if (chartContainerRef.current) {
      // Simulate chart API creation
      const mockChartApi = {
        createPriceLine: (options: any) => {
          // In real implementation, this would create an actual price line on the chart
          console.log('Creating price line:', options);
          return { id: Math.random(), remove: () => console.log('Removing price line') };
        },
        removePriceLine: (line: any) => {
          // In real implementation, this would remove the actual price line
          console.log('Removing price line:', line);
        }
      };
      setChartInstance(mockChartApi);
    }
  }, []);

  if (!priceData) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        Loading chart data...
      </div>
    );
  }

  // Generate historical data
  const historicalData = Array.from({ length: 50 }, (_, i) => {
    const time = new Date(Date.now() - (49 - i) * 60 * 60 * 1000);
    const basePrice = priceData.price;
    const variation = (Math.random() - 0.5) * basePrice * 0.02;
    return {
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: basePrice + variation,
      volume: Math.random() * 1000000
    };
  });

  return (
    <div className="relative h-96" ref={chartContainerRef}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={historicalData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1B2838', border: '1px solid #374151' }}
            labelStyle={{ color: '#FFB800' }}
            formatter={(value: any) => [`$${value.price.toFixed(2)}`, 'Price']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#00D4FF" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Grid overlay for active bot - the bridge component */}
      {activeBot && activeBot.symbol === symbol && chartInstance && (
        <GridOverlay chartApi={chartInstance} />
      )}
    </div>
  );
}

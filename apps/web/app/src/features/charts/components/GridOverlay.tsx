'use client';

import { useEffect } from 'react';
import { useActiveBot } from '../../../shared/store/useTradeStore';

// This component acts as the "bridge" between shared state and chart
// It listens to the shared state and draws lines on top of the chart
export const GridOverlay = ({ chartApi }: { chartApi: any }) => {
  const activeBot = useActiveBot();

  useEffect(() => {
    if (!activeBot || !chartApi) return;

    // 1. Clear old lines before drawing new ones
    const priceLines: any[] = [];

    // 2. Loop through the bot's grid levels and draw them
    activeBot.levels.forEach((level) => {
      const line = chartApi.createPriceLine({
        price: level.price,
        color: level.type === 'BUY' ? '#26a69a' : '#ef5350',
        lineWidth: 2,
        lineStyle: level.status === 'FILLED' ? 0 : 2, // Solid for filled, dashed for pending
        axisLabelVisible: true,
        title: `${level.type} $${level.price.toFixed(2)}`,
      });
      priceLines.push(line);
    });

    // Cleanup function to remove lines when bot is deselected or changed
    return () => {
      priceLines.forEach((line) => chartApi.removePriceLine(line));
    };
  }, [activeBot, chartApi]); // This ensures re-draw when activeBot.levels changes

  return null; // This is a logic-only component
};

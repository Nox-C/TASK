'use client';

import { usePriceFeed } from '../hooks/usePriceFeed';

interface StatusIndicatorProps {
  symbol: string;
}

export const StatusIndicator = ({ symbol }: StatusIndicatorProps) => {
  const { isError, reboot } = usePriceFeed(symbol);
  
  return (
    <div className="p-4 bg-black rounded-lg border border-slate-800">
      <div className={`w-3 h-3 rounded-full ${isError ? 'animate-eve-alarm' : 'bg-cyan-400'}`} />
      {isError && (
        <button 
          onClick={reboot} 
          className="text-red-500 text-xs mt-2 underline hover:text-red-400"
        >
          REBOOT DIRECTIVE
        </button>
      )}
    </div>
  );
};

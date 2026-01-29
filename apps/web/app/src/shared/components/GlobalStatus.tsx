'use client';

import { useGlobalError, useTradeStore } from '../store/useTradeStore';

export const GlobalStatus = () => {
  const globalError = useGlobalError();
  const setGlobalError = useTradeStore((state) => state.setGlobalError);

  const resetError = () => {
    setGlobalError(false);
  };

  return (
    <div className={`status-bar ${globalError ? 'animate-eve-alarm' : 'bg-green-500'} p-2 text-white text-center`}>
      {globalError ? (
        <div className="flex items-center justify-center gap-4">
          <span className="text-xs font-bold">⚠️ SYSTEM ERROR - EVE RED EYE ACTIVATED</span>
          <button 
            onClick={resetError}
            className="px-2 py-1 bg-red-700 rounded text-xs hover:bg-red-600"
          >
            CLEAR SYSTEM ERROR
          </button>
        </div>
      ) : (
        <span className="text-xs">✅ All Systems Operational</span>
      )}
    </div>
  );
};

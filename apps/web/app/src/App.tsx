'use client';

import Main from './main';
import { useBinancePriceFeed } from './shared/hooks/useBinancePriceFeed';

// Global Price Feed Provider - initializes reliable Binance connection
function PriceFeedProvider({ children }: { children: React.ReactNode }) {
  // Initialize single Binance connection for all major trading pairs
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'];
  const { isConnected, error, reconnect } = useBinancePriceFeed(symbols);
  
  return (
    <>
      {/* Connection status indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          top: 10, 
          right: 10, 
          background: isConnected ? '#4CAF50' : '#f44336', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}>
          {isConnected ? '🟢 Binance Connected' : '🔴 Binance Disconnected'}
          {error && <div style={{ fontSize: '10px', marginTop: '2px' }}>{error}</div>}
          {!isConnected && (
            <button 
              onClick={reconnect} 
              style={{ 
                marginTop: '4px', 
                fontSize: '10px',
                background: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '2px',
                padding: '2px 6px',
                cursor: 'pointer'
              }}
            >
              Reconnect
            </button>
          )}
        </div>
      )}
      {children}
    </>
  );
}

export function App() {
  return (
    <PriceFeedProvider>
      <Main />
    </PriceFeedProvider>
  );
}

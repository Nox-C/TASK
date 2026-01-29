'use client';

import Main from './main';
import { useWebSocketManager } from './shared/hooks/useWebSocketManager';

// Global Price Feed Provider - initializes single WebSocket connection
function PriceFeedProvider({ children }: { children: React.ReactNode }) {
  // Initialize single WebSocket for all major trading pairs
  const symbolsToWatch = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'];
  const { isConnected, error, reconnect } = useWebSocketManager(symbolsToWatch);
  
  return (
    <>
      {/* Debug info - can be removed in production */}
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
          zIndex: 9999
        }}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          {error && <div>{error}</div>}
          {!isConnected && (
            <button onClick={reconnect} style={{ marginTop: '4px', fontSize: '10px' }}>
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

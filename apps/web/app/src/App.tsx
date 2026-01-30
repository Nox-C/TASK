'use client';

import Main from './main';
import { useTestPriceFeed } from './shared/hooks/useTestPriceFeed';

// Test Price Feed Provider - simple debugging
function PriceFeedProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, error, reconnect } = useTestPriceFeed();
  
  console.log('🧪 PriceFeedProvider render:', { isConnected, error });
  
  return (
    <>
      {/* Test connection status indicator */}
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: isConnected ? '#4CAF50' : '#f44336', 
        color: 'white', 
        padding: '12px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          {isConnected ? '🟢 Test Hook Working' : '🔴 Test Hook Failed'}
        </div>
        {error && <div style={{ fontSize: '10px', color: '#ffcccc' }}>{error}</div>}
        {!isConnected && (
          <button 
            onClick={reconnect} 
            style={{ 
              fontSize: '9px',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '2px',
              padding: '2px 4px',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            Test Reconnect
          </button>
        )}
      </div>
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

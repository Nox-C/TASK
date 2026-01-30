'use client';

import Main from './main';
import { useUnifiedPriceFeed } from './shared/hooks/useUnifiedPriceFeed';

// Global Price Feed Provider - initializes all exchange connections
function PriceFeedProvider({ children }: { children: React.ReactNode }) {
  // Initialize unified price feed for all major trading pairs
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'];
  const { 
    isConnected, 
    hasErrors, 
    exchangeStatus, 
    reconnectAll,
    reconnectBinance,
    reconnectCoinbase,
    reconnectCryptoCom,
    reconnectDEX
  } = useUnifiedPriceFeed(symbols);
  
  return (
    <>
      {/* Multi-exchange connection status indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          top: 10, 
          right: 10, 
          background: isConnected ? '#4CAF50' : '#f44336', 
          color: 'white', 
          padding: '12px', 
          borderRadius: '4px',
          fontSize: '11px',
          zIndex: 9999,
          fontFamily: 'monospace',
          minWidth: '200px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {isConnected ? '🟢 Exchanges Connected' : '🔴 Exchanges Disconnected'}
          </div>
          
          {/* Individual exchange status */}
          <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
            <div>Binance: {exchangeStatus.binance.isConnected ? '🟢' : '🔴'}</div>
            <div>Coinbase: {exchangeStatus.coinbase.isConnected ? '🟢' : '🔴'}</div>
            <div>Crypto.com: {exchangeStatus.cryptoCom.isConnected ? '🟢' : '🔴'}</div>
            <div>DEX: {exchangeStatus.dex.isConnected ? '🟢' : '🔴'}</div>
          </div>
          
          {/* Error display */}
          {hasErrors && (
            <div style={{ fontSize: '9px', marginTop: '8px', color: '#ffcccc' }}>
              {Object.entries(exchangeStatus).map(([exchange, status]) => 
                status.error ? (
                  <div key={exchange}>{exchange}: {status.error}</div>
                ) : null
              )}
            </div>
          )}
          
          {/* Reconnect buttons */}
          {!isConnected && (
            <div style={{ marginTop: '8px' }}>
              <button 
                onClick={reconnectAll} 
                style={{ 
                  fontSize: '9px',
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  marginRight: '4px'
                }}
              >
                Reconnect All
              </button>
              <button 
                onClick={reconnectBinance} 
                style={{ 
                  fontSize: '9px',
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  marginRight: '2px'
                }}
              >
                Binance
              </button>
              <button 
                onClick={reconnectCoinbase} 
                style={{ 
                  fontSize: '9px',
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  marginRight: '2px'
                }}
              >
                CB
              </button>
              <button 
                onClick={reconnectCryptoCom} 
                style={{ 
                  fontSize: '9px',
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  marginRight: '2px'
                }}
              >
                Crypto.com
              </button>
              <button 
                onClick={reconnectDEX} 
                style={{ 
                  fontSize: '9px',
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '2px 4px',
                  cursor: 'pointer'
                }}
              >
                DEX
              </button>
            </div>
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

'use client';

import Main from './main';
import { usePriceFeed } from './shared/hooks/usePriceFeed';

// Global Price Feed Provider - initializes WebSocket connections once
function PriceFeedProvider({ children }: { children: React.ReactNode }) {
  // Initialize price feeds for major trading pairs
  usePriceFeed('BTCUSDT');
  usePriceFeed('ETHUSDT');
  usePriceFeed('SOLUSDT');
  usePriceFeed('ADAUSDT');
  
  return <>{children}</>;
}

export function App() {
  return (
    <PriceFeedProvider>
      <Main />
    </PriceFeedProvider>
  );
}

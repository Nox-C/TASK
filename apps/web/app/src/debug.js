// Debug script to check what's happening
console.log('Debug: App starting...');
console.log('Debug: Environment variables:', {
  NEXT_PUBLIC_WS_ENDPOINT: process.env.NEXT_PUBLIC_WS_ENDPOINT,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT
});

// Test store access
try {
  const { useTradeStore } = require('./shared/store/useTradeStore');
  console.log('Debug: Store imported successfully');
  
  // Test if we can access the store
  const testStore = useTradeStore.getState();
  console.log('Debug: Store state:', testStore);
} catch (error) {
  console.error('Debug: Store error:', error);
}

// Test price feed hook
try {
  const { usePriceFeed } = require('./shared/hooks/usePriceFeed');
  console.log('Debug: PriceFeed hook imported successfully');
} catch (error) {
  console.error('Debug: PriceFeed hook error:', error);
}

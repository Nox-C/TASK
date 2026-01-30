import { useEffect, useState } from 'react';

export const useTestPriceFeed = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🧪 Test hook mounted');
    setIsConnected(true);
    setError(null);

    return () => {
      console.log('🧪 Test hook unmounted');
    };
  }, []);

  return { isConnected, error, reconnect: () => console.log('🧪 Test reconnect') };
};

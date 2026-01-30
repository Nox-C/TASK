import { useBinancePriceFeed } from './useBinancePriceFeed';
import { useCoinbasePriceFeed } from './useCoinbasePriceFeed';
import { useCryptoComPriceFeed } from './useCryptoComPriceFeed';
import { useDEXPriceFeed } from './useDEXPriceFeed';

interface ExchangeStatus {
  binance: { isConnected: boolean; error: string | null };
  coinbase: { isConnected: boolean; error: string | null };
  cryptoCom: { isConnected: boolean; error: string | null };
  dex: { isConnected: boolean; error: string | null };
}

export const useUnifiedPriceFeed = (symbols: string[]) => {
  // Initialize all exchange feeds
  const binanceFeed = useBinancePriceFeed(symbols);
  const coinbaseFeed = useCoinbasePriceFeed(symbols);
  const cryptoComFeed = useCryptoComPriceFeed(symbols);
  const dexFeed = useDEXPriceFeed(symbols);

  const exchangeStatus: ExchangeStatus = {
    binance: {
      isConnected: binanceFeed.isConnected,
      error: binanceFeed.error
    },
    coinbase: {
      isConnected: coinbaseFeed.isConnected,
      error: coinbaseFeed.error
    },
    cryptoCom: {
      isConnected: cryptoComFeed.isConnected,
      error: cryptoComFeed.error
    },
    dex: {
      isConnected: dexFeed.isConnected,
      error: dexFeed.error
    }
  };

  const overallConnected = Object.values(exchangeStatus).some(status => status.isConnected);
  const hasErrors = Object.values(exchangeStatus).some(status => status.error);

  const reconnectAll = () => {
    binanceFeed.reconnect();
    coinbaseFeed.reconnect();
    cryptoComFeed.reconnect();
    dexFeed.reconnect();
  };

  return {
    isConnected: overallConnected,
    hasErrors,
    exchangeStatus,
    reconnectAll,
    reconnectBinance: binanceFeed.reconnect,
    reconnectCoinbase: coinbaseFeed.reconnect,
    reconnectCryptoCom: cryptoComFeed.reconnect,
    reconnectDEX: dexFeed.reconnect
  };
};

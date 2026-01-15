const WebSocket = require('ws');

console.log('Testing exchange connections...');

// Test Binance WebSocket
const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
binanceWs.on('open', () => {
  console.log('✅ Binance WebSocket connected');
});
binanceWs.on('message', (data) => {
  const parsed = JSON.parse(data.toString());
  if (parsed.e === '24hrTicker') {
    console.log(`📊 Binance BTC Price: $${parsed.c}`);
  }
});
binanceWs.on('error', (error) => {
  console.log('❌ Binance error:', error.message);
});

// Test Coinbase WebSocket
const coinbaseWs = new WebSocket('wss://ws-feed.exchange.coinbase.com');
coinbaseWs.on('open', () => {
  console.log('✅ Coinbase WebSocket connected');
  // Subscribe to BTC-USD ticker
  coinbaseWs.send(JSON.stringify({
    type: 'subscribe',
    product_ids: ['BTC-USD'],
    channels: ['ticker']
  }));
});
coinbaseWs.on('message', (data) => {
  const parsed = JSON.parse(data.toString());
  if (parsed.type === 'ticker' && parsed.product_id === 'BTC-USD') {
    console.log(`📊 Coinbase BTC Price: $${parsed.price}`);
  }
});
coinbaseWs.on('error', (error) => {
  console.log('❌ Coinbase error:', error.message);
});

// Test Crypto.com WebSocket  
const cryptoComWs = new WebSocket('wss://stream.crypto.com/v2/market');
cryptoComWs.on('open', () => {
  console.log('✅ Crypto.com WebSocket connected');
  // Subscribe to BTC_USDT ticker
  cryptoComWs.send(JSON.stringify({
    id: Date.now(),
    method: 'subscribe',
    params: {
      channels: ['ticker.btc_usdt']
    }
  }));
});
cryptoComWs.on('message', (data) => {
  const parsed = JSON.parse(data.toString());
  if (parsed.method === 'ticker' && parsed.result && parsed.result.data) {
    const ticker = parsed.result.data;
    console.log(`📊 Crypto.com BTC Price: $${ticker.a}`);
  }
});
cryptoComWs.on('error', (error) => {
  console.log('❌ Crypto.com error:', error.message);
});

setTimeout(() => {
  console.log('\n🔍 Testing WebSocket connections for 10 seconds...');
  setTimeout(() => {
    console.log('\n✅ Test complete. All exchanges should be connected now.');
    process.exit(0);
  }, 10000);
}, 1000);

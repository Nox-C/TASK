const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default strategies
  await prisma.strategy.createMany({
    data: [
      { name: 'RSI_REVERSAL', description: 'Buy when RSI < 30, Sell when RSI > 70' },
      { name: 'MACD_CROSS', description: 'Buy on MACD bullish cross, Sell on bearish cross' },
      { name: 'GRID_TRADING', description: 'Place buy/sell orders in a grid pattern' },
      { name: 'BOLLINGER_BANDS', description: 'Trade based on Bollinger Band bounces' },
      { name: 'MOVING_AVERAGE', description: 'Buy when price crosses above MA, sell below' },
    ],
    skipDuplicates: true,
  });

  // Create sample bot
  await prisma.bot.create({
    data: {
      name: 'Demo BTC Bot',
      strategy: 'RSI_REVERSAL',
      exchange: 'binance',
      tradingPair: 'BTC/USDT',
      status: 'STOPPED',
      positionSize: 10,
      stopLoss: 2,
      takeProfit: 5,
      totalPnl: 0,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

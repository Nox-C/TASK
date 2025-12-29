import { ReplayMarketAdapter } from '@task/adapters';
import fs from 'fs';
import path from 'path';

export async function runReplayFromFile(filePath: string, options: { intervalMs?: number } = {}) {
  const json = fs.readFileSync(path.resolve(filePath), 'utf8');
  const ticks = JSON.parse(json) as Array<any>;
  const adapter = new ReplayMarketAdapter();
  adapter.loadTicks(ticks);
  if (options.intervalMs) adapter.setIntervalMs(options.intervalMs);

  adapter.subscribePrice('BTC', (price) => {
    console.log('[replay] BTC price', price);
  });

  adapter.start();
  return new Promise<void>((resolve) => {
    // resolve when adapter stops
    const check = setInterval(() => {
      // naive check: if adapter has no timer, it's stopped
      // @ts-ignore internal
      if (!adapter['timer']) { clearInterval(check); resolve(); }
    }, 200);
  });
}

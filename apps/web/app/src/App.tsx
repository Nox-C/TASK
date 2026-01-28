'use client';

import Main from './main';
import { ActiveBotProvider } from './shared/context/ActiveBotContext';
import { PriceFeedProvider } from './shared/context/PriceFeedContext';

export function App() {
  return (
    <PriceFeedProvider>
      <ActiveBotProvider>
        <Main />
      </ActiveBotProvider>
    </PriceFeedProvider>
  );
}

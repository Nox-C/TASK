import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BotList } from './BotList';
import { botApi } from '../../../shared/services/botApi';
import { useTradeStore, useActiveBot } from '../../../shared/store/useTradeStore';

// Mock dependencies
jest.mock('../../../shared/services/botApi');
jest.mock('../../../shared/components/EVEIcon', () => ({
  EVEIcon: ({ status }: { status: string }) => <div data-testid={`eve-icon-${status}`} />
}));

// Mock Zustand hooks
jest.mock('../../../shared/store/useTradeStore', () => ({
  useTradeStore: jest.fn(),
  useActiveBot: jest.fn()
}));

const mockBots = [
  {
    id: 'bot-1',
    name: 'Alpha Grid',
    symbol: 'BTC-USDT',
    status: 'RUNNING',
    totalPnl: 12.5,
    strategy: 'Grid',
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 10,
    positionSize: 100,
    stopLoss: 5,
    takeProfit: 10
  },
  {
    id: 'bot-2',
    name: 'Beta DCA',
    symbol: 'ETH-USDT',
    status: 'STOPPED',
    totalPnl: -2.1,
    strategy: 'DCA',
    lowerPrice: 3000,
    upperPrice: 4000,
    gridCount: 5,
    positionSize: 50,
    stopLoss: 2,
    takeProfit: 5
  }
];

describe('BotList Component', () => {
  const mockSetActiveBot = jest.fn();
  const mockGetBacktestResults = jest.fn().mockReturnValue([]);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Store Mocks
    (useTradeStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        setActiveBot: mockSetActiveBot,
        getBacktestResults: mockGetBacktestResults,
        prices: { 'BTC-USDT': { price: 55000 }, 'ETH-USDT': { price: 3500 } }
      };
      return selector(state);
    });
    (useActiveBot as unknown as jest.Mock).mockReturnValue(null);

    // Setup API Mocks
    (botApi.fetchBots as jest.Mock).mockResolvedValue(mockBots);
  });

  it('fetches and renders bots on mount', async () => {
    render(<BotList />);

    expect(screen.getByText('Syncing Modules...')).toBeInTheDocument(); // Initial loading state

    await waitFor(() => {
      expect(screen.getByText('Alpha Grid')).toBeInTheDocument();
      expect(screen.getByText('Beta DCA')).toBeInTheDocument();
    });

    expect(botApi.fetchBots).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Current: $55,000')).toBeInTheDocument(); // Price check
    expect(screen.getByText('$12.50')).toBeInTheDocument(); // PnL check
    expect(screen.getByTestId('eve-icon-running')).toBeInTheDocument();
  });
});
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { arbitrum, avalanche, bsc, mainnet, optimism, polygon } from 'wagmi/chains'

// Web3 configuration for TASK control panel
export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, bsc, avalanche],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Chain configurations for trading
export const supportedChains = [
  {
    ...mainnet,
    name: 'Ethereum',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
  },
  {
    ...polygon,
    name: 'Polygon',
    symbol: 'MATIC', 
    explorer: 'https://polygonscan.com',
  },
  {
    ...arbitrum,
    name: 'Arbitrum',
    symbol: 'ARB',
    explorer: 'https://arbiscan.io',
  },
  {
    ...optimism,
    name: 'Optimism',
    symbol: 'OP',
    explorer: 'https://optimistic.etherscan.io',
  },
  {
    ...bsc,
    name: 'BSC',
    symbol: 'BNB',
    explorer: 'https://bscscan.com',
  },
  {
    ...avalanche,
    name: 'Avalanche',
    symbol: 'AVAX',
    explorer: 'https://snowtrace.io',
  },
]

// Popular DEX routers for trading
export const dexRouters = {
  ethereum: {
    uniswap: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    '1inch': '0x111111125421cA6dc452d289314280a0f8842A65',
    sushiswap: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  },
  polygon: {
    quickswap: '0xa5E0829CaCEd27fF6Af177F16d4456F9d8A377b6',
    sushiswap: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    uniswap: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  },
  arbitrum: {
    uniswap: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    '1inch': '0x111111125421cA6dc452d289314280a0f8842A65',
  },
}

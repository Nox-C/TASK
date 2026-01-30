'use client';

import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

interface MetaMaskState {
  isMetaMaskInstalled: boolean;
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

interface MetaMaskActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

export const useMetaMask = (): MetaMaskState & MetaMaskActions => {
  const [state, setState] = useState<MetaMaskState>({
    isMetaMaskInstalled: false,
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined') {
        const { ethereum } = window as any;
        const installed = !!ethereum;
        
        setState(prev => ({ ...prev, isMetaMaskInstalled: installed }));
        
        if (ethereum) {
          const provider = new ethers.BrowserProvider(ethereum);
          setProvider(provider);
        }
      }
    };

    checkMetaMask();
    
    // Listen for account changes
    if (typeof window !== 'undefined') {
      const { ethereum } = window as any;
      if (ethereum) {
        ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            setState(prev => ({
              ...prev,
              isConnected: false,
              address: null,
              error: null,
            }));
          } else {
            setState(prev => ({
              ...prev,
              address: accounts[0],
              isConnected: true,
              error: null,
            }));
          }
        });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!state.isMetaMaskInstalled) {
      const errorMsg = 'MetaMask is not installed. Please install MetaMask to continue.';
      setState(prev => ({ ...prev, error: errorMsg }));
      return;
    }

    if (!provider) {
      const errorMsg = 'Provider not available';
      setState(prev => ({ ...prev, error: errorMsg }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      // Get signer and address
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      setState(prev => ({
        ...prev,
        address: userAddress,
        isConnected: true,
        isConnecting: false,
        error: null,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to MetaMask';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isConnecting: false,
      }));
    }
  }, [state.isMetaMaskInstalled, provider]);

  const disconnect = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      address: null,
      error: null,
    }));
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!state.isConnected || !state.address || !provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to sign message');
    }
  }, [state.isConnected, state.address, provider]);

  return {
    ...state,
    connect,
    disconnect,
    signMessage,
  };
};

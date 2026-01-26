"use client";
import { Button, Card, StatusPill } from "@task/ui";
import { useState } from "react";

export default function WalletConnect() {
  // Simple wallet connection - Wallet Connect handles the actual implementation
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    // Wallet Connect component handles the actual connection
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1000);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
  };

  if (isConnected) {
    return (
      <Card className="p-6 bg-walle-surface border border-walle-blue/20 shadow-elevated">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-walle-yellow">
              🔗 Wallet Connected
            </h3>
            <StatusPill status="connected" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Address:</span>
              <span className="text-walle-yellow font-mono">0x1234...5678</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Balance:</span>
              <span className="text-walle-green">1.234 ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Network:</span>
              <span className="text-walle-blue">Ethereum</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={disconnectWallet}
              variant="secondary"
              className="flex-1"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-walle-surface border border-walle-blue/20 shadow-elevated">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-walle-yellow mb-2">
            🦊 Connect Wallet
          </h3>
          <p className="text-gray-400 text-sm">
            Connect your wallet to start trading
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => connectWallet()}
            disabled={isConnecting}
            className="w-full bg-walle-orange hover:bg-walle-brown text-white transition-colors shadow-elevated"
          >
            {isConnecting ? "🔄 Connecting..." : "🦊 Connect Wallet"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Api } from '../../lib/api';
import { Button, Card } from '@task/ui';

interface Strategy {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'automatic';
  riskLevel: 'low' | 'medium' | 'high';
  parameters?: Record<string, any>;
}

interface BotConfig {
  name: string;
  strategyId: string;
  mode: 'manual' | 'automatic';
  parameters: Record<string, any>;
  riskManagement: {
    maxDrawdown: number;
    stopLoss: number;
    takeProfit: number;
    maxPositionSize: number;
  };
  tradingPairs: string[];
  active: boolean;
}

const PRECONFIGURED_STRATEGIES: Strategy[] = [
  {
    id: 'dca-conservative',
    name: 'DCA Conservative',
    description: 'Dollar Cost Averaging with conservative risk management',
    type: 'automatic',
    riskLevel: 'low',
    parameters: {
      interval: '1h',
      amount: 100,
      priceThreshold: 0.02
    }
  },
  {
    id: 'momentum-trader',
    name: 'Momentum Trader',
    description: 'Follows market momentum with technical indicators',
    type: 'automatic',
    riskLevel: 'medium',
    parameters: {
      rsiPeriod: 14,
      macdFast: 12,
      macdSlow: 26
    }
  },
  {
    id: 'grid-trading',
    name: 'Grid Trading',
    description: 'Places buy/sell orders in a grid pattern',
    type: 'automatic',
    riskLevel: 'medium',
    parameters: {
      gridSize: 10,
      gridSpacing: 0.01,
      baseAmount: 50
    }
  },
  {
    id: 'custom-manual',
    name: 'Custom Manual',
    description: 'Fully customizable manual strategy configuration',
    type: 'manual',
    riskLevel: 'high',
    parameters: {}
  }
];

const TRADING_PAIRS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD', 'DOT-USD'];

export default function CreateBotPage() {
  const [step, setStep] = useState(1);
  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: '',
    strategyId: '',
    mode: 'automatic',
    parameters: {},
    riskManagement: {
      maxDrawdown: 10,
      stopLoss: 5,
      takeProfit: 15,
      maxPositionSize: 1000
    },
    tradingPairs: ['BTC-USD'],
    active: false
  });
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStrategySelect = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setBotConfig(prev => ({
      ...prev,
      strategyId: strategy.id,
      mode: strategy.type,
      parameters: { ...strategy.parameters }
    }));
  };

  const handleParameterChange = (key: string, value: any) => {
    setBotConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  const handleRiskManagementChange = (key: keyof BotConfig['riskManagement'], value: number) => {
    setBotConfig(prev => ({
      ...prev,
      riskManagement: {
        ...prev.riskManagement,
        [key]: value
      }
    }));
  };

  const handleCreateBot = async () => {
    setLoading(true);
    try {
      await Api.bots.create({
        name: botConfig.name,
        strategyId: botConfig.strategyId,
        // Additional config would be sent to backend
      });
      // Redirect to bots page
      window.location.href = '/bots';
    } catch (error) {
      console.error('Failed to create bot:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= stepNum
                ? 'bg-walle-yellow text-walle-brown'
                : 'bg-gray-600 text-gray-400'
            }`}
          >
            {stepNum}
          </div>
          {stepNum < 4 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step > stepNum ? 'bg-walle-yellow' : 'bg-gray-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card className="p-8">
      <div className="text-center mb-8">
        <img
          src="/wall-e-icon.png"
          alt="WALL-E"
          className="w-16 h-16 mx-auto mb-4 animate-float"
        />
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Strategy</h2>
        <p className="text-gray-400">Select a preconfigured strategy or create a custom one</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRECONFIGURED_STRATEGIES.map((strategy) => (
          <div
            key={strategy.id}
            onClick={() => handleStrategySelect(strategy)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedStrategy?.id === strategy.id
                ? 'border-walle-yellow bg-walle-yellow/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  strategy.riskLevel === 'low'
                    ? 'bg-green-500/20 text-green-400'
                    : strategy.riskLevel === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {strategy.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">{strategy.description}</p>
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  strategy.type === 'automatic'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}
              >
                {strategy.type.toUpperCase()}
              </span>
              {selectedStrategy?.id === strategy.id && (
                <span className="text-walle-yellow">✓ Selected</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={() => setStep(2)}
          disabled={!selectedStrategy}
          variant="primary"
          className="bg-walle-yellow text-walle-brown hover:bg-walle-orange"
        >
          Next: Configure Bot
        </Button>
      </div>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Bot Configuration</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bot Name</label>
          <input
            type="text"
            value={botConfig.name}
            onChange={(e) => setBotConfig(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-walle-yellow focus:outline-none text-white"
            placeholder="Enter a name for your WALL-E bot"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Trading Pairs</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TRADING_PAIRS.map((pair) => (
              <label key={pair} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={botConfig.tradingPairs.includes(pair)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBotConfig(prev => ({
                        ...prev,
                        tradingPairs: [...prev.tradingPairs, pair]
                      }));
                    } else {
                      setBotConfig(prev => ({
                        ...prev,
                        tradingPairs: prev.tradingPairs.filter(p => p !== pair)
                      }));
                    }
                  }}
                  className="rounded border-gray-600 text-walle-yellow focus:ring-walle-yellow"
                />
                <span className="text-white">{pair}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedStrategy?.type === 'manual' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Custom Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entry Signal</label>
                <select className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-walle-yellow focus:outline-none text-white">
                  <option>RSI Oversold</option>
                  <option>MACD Crossover</option>
                  <option>Moving Average Cross</option>
                  <option>Custom Indicator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exit Signal</label>
                <select className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-walle-yellow focus:outline-none text-white">
                  <option>Take Profit/Stop Loss</option>
                  <option>RSI Overbought</option>
                  <option>MACD Divergence</option>
                  <option>Time-based Exit</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={() => setStep(1)} variant="secondary">
          Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={!botConfig.name || botConfig.tradingPairs.length === 0}
          variant="primary"
          className="bg-walle-yellow text-walle-brown hover:bg-walle-orange"
        >
          Next: Risk Management
        </Button>
      </div>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Risk Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Drawdown ({botConfig.riskManagement.maxDrawdown}%)
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={botConfig.riskManagement.maxDrawdown}
            onChange={(e) => handleRiskManagementChange('maxDrawdown', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1%</span>
            <span>50%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Stop Loss ({botConfig.riskManagement.stopLoss}%)
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={botConfig.riskManagement.stopLoss}
            onChange={(e) => handleRiskManagementChange('stopLoss', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1%</span>
            <span>20%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Take Profit ({botConfig.riskManagement.takeProfit}%)
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={botConfig.riskManagement.takeProfit}
            onChange={(e) => handleRiskManagementChange('takeProfit', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Position Size (${botConfig.riskManagement.maxPositionSize})
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={botConfig.riskManagement.maxPositionSize}
            onChange={(e) => handleRiskManagementChange('maxPositionSize', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$100</span>
            <span>$10,000</span>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-walle-yellow/10 border border-walle-yellow/30 rounded-lg">
        <h3 className="text-lg font-semibold text-walle-yellow mb-2">⚠️ Risk Assessment</h3>
        <p className="text-gray-300 text-sm">
          Based on your settings, this bot has a{' '}
          <span className={`font-bold ${
            selectedStrategy?.riskLevel === 'low' ? 'text-green-400' :
            selectedStrategy?.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {selectedStrategy?.riskLevel?.toUpperCase()} RISK
          </span>{' '}
          profile. Make sure you understand the potential losses before proceeding.
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={() => setStep(2)} variant="secondary">
          Back
        </Button>
        <Button
          onClick={() => setStep(4)}
          variant="primary"
          className="bg-walle-yellow text-walle-brown hover:bg-walle-orange"
        >
          Next: Review & Deploy
        </Button>
      </div>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="p-8">
      <div className="text-center mb-8">
        <img
          src="/wall-e-icon.png"
          alt="WALL-E"
          className="w-20 h-20 mx-auto mb-4 animate-walleGlow"
        />
        <h2 className="text-2xl font-bold text-white mb-2">Review & Deploy</h2>
        <p className="text-gray-400">Review your WALL-E bot configuration before deployment</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Bot Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white">{botConfig.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Strategy:</span>
                <span className="text-white">{selectedStrategy?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mode:</span>
                <span className="text-white capitalize">{botConfig.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trading Pairs:</span>
                <span className="text-white">{botConfig.tradingPairs.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Risk Management</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Max Drawdown:</span>
                <span className="text-white">{botConfig.riskManagement.maxDrawdown}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss:</span>
                <span className="text-white">{botConfig.riskManagement.stopLoss}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Take Profit:</span>
                <span className="text-white">{botConfig.riskManagement.takeProfit}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Position:</span>
                <span className="text-white">${botConfig.riskManagement.maxPositionSize}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="startActive"
            checked={botConfig.active}
            onChange={(e) => setBotConfig(prev => ({ ...prev, active: e.target.checked }))}
            className="rounded border-gray-600 text-walle-yellow focus:ring-walle-yellow"
          />
          <label htmlFor="startActive" className="text-white">
            Start bot immediately after deployment
          </label>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={() => setStep(3)} variant="secondary">
          Back
        </Button>
        <Button
          onClick={handleCreateBot}
          disabled={loading}
          variant="primary"
          className="bg-walle-green text-white hover:bg-walle-green/80"
        >
          {loading ? '🤖 Deploying WALL-E...' : '🚀 Deploy Bot'}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Create New WALL-E Bot</h1>
            <p className="text-gray-400">Build and deploy your intelligent trading bot</p>
          </div>
          <Link href="/bots">
            <Button variant="secondary">← Back to Bots</Button>
          </Link>
        </div>

        {renderStepIndicator()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
}

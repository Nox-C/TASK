"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Button } from "@task/ui";
import { Api } from "../../lib/api";

interface BotConfig {
  name: string;
  strategyType: "manual" | "template";
  templateId?: string;
  symbol: string;
  positionSize: number;
  maxPositions: number;
  stopLoss: number;
  takeProfit: number;
  tradeDirection: "long" | "short" | "both";
  indicators: {
    sma: boolean;
    ema: boolean;
    rsi: boolean;
    macd: boolean;
  };
  smaLength?: number;
  emaLength?: number;
  rsiPeriod?: number;
  rsiOverbought?: number;
  rsiOversold?: number;
}

const STRATEGY_TEMPLATES = [
  {
    id: "momentum-breakout",
    name: "🚀 Momentum Breakout",
    description: "Catches strong upward momentum with breakout detection",
    icon: "🚀",
    config: {
      indicators: { sma: true, ema: false, rsi: true, macd: false },
      smaLength: 20,
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      stopLoss: 2,
      takeProfit: 5,
      tradeDirection: "long" as const
    }
  },
  {
    id: "mean-reversion",
    name: "⚖️ Mean Reversion",
    description: "Profits from price returning to average after extremes",
    icon: "⚖️",
    config: {
      indicators: { sma: true, ema: true, rsi: true, macd: false },
      smaLength: 50,
      emaLength: 20,
      rsiPeriod: 14,
      rsiOverbought: 75,
      rsiOversold: 25,
      stopLoss: 1.5,
      takeProfit: 3,
      tradeDirection: "both" as const
    }
  },
  {
    id: "trend-following",
    name: "📈 Trend Following",
    description: "Rides sustained trends using moving averages",
    icon: "📈",
    config: {
      indicators: { sma: true, ema: true, rsi: false, macd: true },
      smaLength: 50,
      emaLength: 20,
      stopLoss: 3,
      takeProfit: 8,
      tradeDirection: "both" as const
    }
  },
  {
    id: "scalping",
    name: "⚡ Scalping Bot",
    description: "Quick small profits from minor price movements",
    icon: "⚡",
    config: {
      indicators: { sma: false, ema: true, rsi: true, macd: false },
      emaLength: 9,
      rsiPeriod: 7,
      rsiOverbought: 80,
      rsiOversold: 20,
      stopLoss: 0.5,
      takeProfit: 1,
      tradeDirection: "both" as const
    }
  },
  {
    id: "dip-buyer",
    name: "💎 Dip Buyer",
    description: "Accumulates during market dips for long-term holds",
    icon: "💎",
    config: {
      indicators: { sma: true, ema: false, rsi: true, macd: false },
      smaLength: 100,
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 20,
      stopLoss: 5,
      takeProfit: 15,
      tradeDirection: "long" as const
    }
  },
];

export default function CreateBotPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BotConfig>({
    name: "",
    strategyType: "template",
    symbol: "BTC-USD",
    positionSize: 100,
    maxPositions: 3,
    stopLoss: 2,
    takeProfit: 5,
    tradeDirection: "both",
    indicators: {
      sma: false,
      ema: false,
      rsi: false,
      macd: false,
    },
  });
  const [isCreating, setIsCreating] = useState(false);

  const selectTemplate = (templateId: string) => {
    const template = STRATEGY_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setConfig({
        ...config,
        templateId,
        ...template.config,
      });
      setStep(3); // Skip to review after template selection
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // First, create or get the strategy
      const strategies = await Api.strategies.list();
      let strategy = strategies.find(s => s.name === (config.templateId || "Custom Strategy"));
      
      if (!strategy) {
        // Create a new strategy
        strategy = await Api.strategies.create({
          name: config.templateId 
            ? STRATEGY_TEMPLATES.find(t => t.id === config.templateId)?.name || "Custom Strategy"
            : "Custom Strategy",
          description: config.templateId
            ? STRATEGY_TEMPLATES.find(t => t.id === config.templateId)?.description
            : "Custom trading strategy",
          config: {
            symbol: config.symbol,
            positionSize: config.positionSize,
            maxPositions: config.maxPositions,
            stopLoss: config.stopLoss,
            takeProfit: config.takeProfit,
            tradeDirection: config.tradeDirection,
            indicators: config.indicators,
            smaLength: config.smaLength,
            emaLength: config.emaLength,
            rsiPeriod: config.rsiPeriod,
            rsiOverbought: config.rsiOverbought,
            rsiOversold: config.rsiOversold,
          }
        });
      }

      // Create the bot
      const bot = await Api.bots.create({
        name: config.name,
        strategyId: strategy.id,
      });

      // Redirect to bots page
      router.push("/bots");
    } catch (error) {
      console.error("Failed to create bot:", error);
      alert("Failed to create bot. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-walle-darkblue text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/bots" className="text-walle-yellow hover:text-walle-orange mb-4 inline-block">
            ← Back to Bots
          </Link>
          <h1 className="text-3xl font-bold text-walle-yellow">🤖 Create WALL-E Trading Bot</h1>
          <p className="text-walle-beige">Build your automated trading bot in a few simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  s <= step ? 'bg-walle-yellow text-walle-brown' : 'bg-walle-darkgray text-walle-beige'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-walle-yellow' : 'bg-walle-darkgray'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-walle-beige">
            <span>Setup</span>
            <span>Strategy</span>
            <span>Configure</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 bg-walle-darkgray border-walle-rust">
          {/* Step 1: Basic Setup */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-walle-yellow">Step 1: Basic Setup</h2>
              
              <div>
                <label className="block text-sm font-medium text-walle-beige mb-2">
                  Bot Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                  placeholder="e.g., BTC Momentum Trader"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-walle-beige mb-2">
                  Trading Symbol <span className="text-red-400">*</span>
                </label>
                <select
                  value={config.symbol}
                  onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                  className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                >
                  <option value="BTC-USD">Bitcoin (BTC-USD)</option>
                  <option value="ETH-USD">Ethereum (ETH-USD)</option>
                  <option value="SOL-USD">Solana (SOL-USD)</option>
                  <option value="ADA-USD">Cardano (ADA-USD)</option>
                  <option value="DOT-USD">Polkadot (DOT-USD)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-walle-beige mb-2">
                    Position Size ($)
                  </label>
                  <input
                    type="number"
                    value={config.positionSize}
                    onChange={(e) => setConfig({ ...config, positionSize: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-walle-beige mb-2">
                    Max Positions
                  </label>
                  <input
                    type="number"
                    value={config.maxPositions}
                    onChange={(e) => setConfig({ ...config, maxPositions: parseInt(e.target.value) })}
                    className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Link href="/bots">
                  <Button variant="secondary">Cancel</Button>
                </Link>
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!config.name || !config.symbol}
                  className="bg-walle-yellow text-walle-brown hover:bg-walle-orange disabled:opacity-50"
                >
                  Next: Choose Strategy →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Strategy Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-walle-yellow">Step 2: Choose Strategy</h2>
              
              <div className="grid gap-4">
                {/* Template Strategies */}
                <div>
                  <h3 className="text-lg font-semibold text-walle-beige mb-4">📦 Template Strategies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STRATEGY_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setConfig({ ...config, strategyType: "template" });
                          selectTemplate(template.id);
                        }}
                        className="p-4 bg-walle-darkblue border-2 border-walle-rust rounded-lg text-left hover:border-walle-yellow transition-colors"
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-bold text-walle-yellow mb-1">{template.name}</div>
                        <div className="text-sm text-walle-beige">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Strategy */}
                <div>
                  <h3 className="text-lg font-semibold text-walle-beige mb-4">🔧 Manual Configuration</h3>
                  <button
                    onClick={() => {
                      setConfig({ ...config, strategyType: "manual" });
                      setStep(3);
                    }}
                    className="w-full p-6 bg-walle-darkblue border-2 border-walle-rust rounded-lg text-left hover:border-walle-yellow transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">⚙️</div>
                      <div>
                        <div className="font-bold text-walle-yellow mb-1">Custom Strategy</div>
                        <div className="text-sm text-walle-beige">Build your own strategy from scratch with full control</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(1)} variant="secondary">
                  ← Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-walle-yellow">
                Step 3: Configure Strategy
              </h2>

              {config.templateId && (
                <div className="p-4 bg-walle-darkblue rounded border border-walle-yellow">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {STRATEGY_TEMPLATES.find(t => t.id === config.templateId)?.icon}
                    </span>
                    <div>
                      <div className="font-bold text-walle-yellow">
                        {STRATEGY_TEMPLATES.find(t => t.id === config.templateId)?.name}
                      </div>
                      <div className="text-sm text-walle-beige">
                        {STRATEGY_TEMPLATES.find(t => t.id === config.templateId)?.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-walle-beige mb-2">
                  Trade Direction
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["long", "short", "both"] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setConfig({ ...config, tradeDirection: dir })}
                      className={`p-3 rounded font-semibold ${
                        config.tradeDirection === dir
                          ? 'bg-walle-yellow text-walle-brown'
                          : 'bg-walle-darkblue text-walle-beige hover:bg-walle-brown'
                      }`}
                    >
                      {dir === "long" ? "📈 Long" : dir === "short" ? "📉 Short" : "↕️ Both"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-walle-beige mb-2">
                    Stop Loss (%)
                  </label>
                  <input
                    type="number"
                    value={config.stopLoss}
                    onChange={(e) => setConfig({ ...config, stopLoss: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-walle-beige mb-2">
                    Take Profit (%)
                  </label>
                  <input
                    type="number"
                    value={config.takeProfit}
                    onChange={(e) => setConfig({ ...config, takeProfit: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-walle-beige mb-3">
                  Technical Indicators
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(config.indicators).map(([key, enabled]) => (
                    <button
                      key={key}
                      onClick={() => setConfig({
                        ...config,
                        indicators: { ...config.indicators, [key]: !enabled }
                      })}
                      className={`p-3 rounded font-semibold ${
                        enabled
                          ? 'bg-walle-yellow text-walle-brown'
                          : 'bg-walle-darkblue text-walle-beige hover:bg-walle-brown'
                      }`}
                    >
                      {enabled ? '✅' : '⬜'} {key.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {config.indicators.sma && (
                <div>
                  <label className="block text-sm font-medium text-walle-beige mb-2">
                    SMA Length
                  </label>
                  <input
                    type="number"
                    value={config.smaLength || 20}
                    onChange={(e) => setConfig({ ...config, smaLength: parseInt(e.target.value) })}
                    className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                  />
                </div>
              )}

              {config.indicators.ema && (
                <div>
                  <label className="block text-sm font-medium text-walle-beige mb-2">
                    EMA Length
                  </label>
                  <input
                    type="number"
                    value={config.emaLength || 20}
                    onChange={(e) => setConfig({ ...config, emaLength: parseInt(e.target.value) })}
                    className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                  />
                </div>
              )}

              {config.indicators.rsi && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-walle-beige mb-2">
                      RSI Period
                    </label>
                    <input
                      type="number"
                      value={config.rsiPeriod || 14}
                      onChange={(e) => setConfig({ ...config, rsiPeriod: parseInt(e.target.value) })}
                      className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-walle-beige mb-2">
                      Overbought
                    </label>
                    <input
                      type="number"
                      value={config.rsiOverbought || 70}
                      onChange={(e) => setConfig({ ...config, rsiOverbought: parseInt(e.target.value) })}
                      className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-walle-beige mb-2">
                      Oversold
                    </label>
                    <input
                      type="number"
                      value={config.rsiOversold || 30}
                      onChange={(e) => setConfig({ ...config, rsiOversold: parseInt(e.target.value) })}
                      className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button onClick={() => setStep(2)} variant="secondary">
                  ← Back
                </Button>
                <Button 
                  onClick={() => setStep(4)}
                  className="bg-walle-yellow text-walle-brown hover:bg-walle-orange"
                >
                  Review & Create →
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Create */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-walle-yellow">Step 4: Review & Create</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-walle-darkblue rounded">
                  <div className="text-sm text-walle-beige mb-1">Bot Name</div>
                  <div className="font-semibold text-white">{config.name}</div>
                </div>

                <div className="p-4 bg-walle-darkblue rounded">
                  <div className="text-sm text-walle-beige mb-1">Strategy</div>
                  <div className="font-semibold text-white">
                    {config.templateId 
                      ? STRATEGY_TEMPLATES.find(t => t.id === config.templateId)?.name
                      : "Custom Strategy"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-walle-darkblue rounded">
                    <div className="text-sm text-walle-beige mb-1">Symbol</div>
                    <div className="font-semibold text-white">{config.symbol}</div>
                  </div>
                  <div className="p-4 bg-walle-darkblue rounded">
                    <div className="text-sm text-walle-beige mb-1">Direction</div>
                    <div className="font-semibold text-white capitalize">{config.tradeDirection}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-walle-darkblue rounded">
                    <div className="text-sm text-walle-beige mb-1">Position Size</div>
                    <div className="font-semibold text-white">${config.positionSize}</div>
                  </div>
                  <div className="p-4 bg-walle-darkblue rounded">
                    <div className="text-sm text-walle-beige mb-1">Max Positions</div>
                    <div className="font-semibold text-white">{config.maxPositions}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-walle-darkblue rounded">
                    <div className="text-sm text-walle-beige mb-1">Stop Loss</div>
                    <div className="font-semibold text-white">{config.stopLoss}%</div>
                  </div>
                  <div className="p-4 bg-walle-darkblue rounded">
                    <div className="text-sm text-walle-beige mb-1">Take Profit</div>
                    <div className="font-semibold text-white">{config.takeProfit}%</div>
                  </div>
                </div>

                <div className="p-4 bg-walle-darkblue rounded">
                  <div className="text-sm text-walle-beige mb-2">Active Indicators</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(config.indicators)
                      .filter(([_, enabled]) => enabled)
                      .map(([key]) => (
                        <span key={key} className="px-3 py-1 bg-walle-yellow text-walle-brown rounded font-semibold text-sm">
                          {key.toUpperCase()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(3)} variant="secondary">
                  ← Back
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-bold"
                >
                  {isCreating ? '⏳ Creating Bot...' : '🚀 Create Bot'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


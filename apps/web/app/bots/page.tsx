'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Api } from '../lib/api';
import { Button, Card, StatusPill, Skeleton } from '@task/ui';
import { connectActivity } from '../lib/ws';

export default function BotsPage() {
  const [bots, setBots] = useState<Awaited<ReturnType<typeof Api.bots.list>>>([]);
  const [strategies, setStrategies] = useState<Awaited<ReturnType<typeof Api.strategies.list>>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBot, setNewBot] = useState({ name: '', strategyId: '' });
  const [isConnected, setIsConnected] = useState(false);
  const [liveActivity, setLiveActivity] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [botsData, strategiesData] = await Promise.all([
          Api.bots.list(),
          Api.strategies.list()
        ]);
        setBots(botsData);
        setStrategies(strategiesData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // WebSocket connection for real-time bot activity
  useEffect(() => {
    const disconnect = connectActivity({
      onEvent: (data) => {
        // Track bot activity
        if ((data as any).type === 'bot' && (data as any).payload) {
          const payload = (data as any).payload;
          setLiveActivity(prev => ({
            ...prev,
            [payload.botId]: {
              ...payload,
              timestamp: Date.now()
            }
          }));
        }
      },
      onStatusChange: (s) => setIsConnected(s === 'connected'),
    });
    return () => disconnect();
  }, []);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created: any = await Api.bots.create(newBot);
      setBots([...bots, created]);
      setNewBot({ name: '', strategyId: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create bot:', error);
    }
  };

  const toggleBot = async (botId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) await Api.bots.stop(botId); else await Api.bots.start(botId);
      setBots(bots.map(bot => 
        bot.id === botId ? { ...bot, active: !currentStatus } : bot
      ));
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-walle-darkblue text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-48 bg-walle-darkgray rounded mb-2" />
              <div className="h-4 w-72 bg-walle-darkgray rounded" />
            </div>
            <div className="h-9 w-28 bg-walle-darkgray rounded" />
          </div>
          <Card className="p-6 bg-walle-darkgray">
            <div className="h-5 w-40 bg-walle-brown rounded mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-16" rounded="xl" />
              <Skeleton className="h-16" rounded="xl" />
              <Skeleton className="h-16" rounded="xl" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const activeBots = bots.filter(b => b.active).length;
  const totalBots = bots.length;

  return (
    <div className="min-h-screen bg-walle-darkblue text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-walle-yellow">🤖 WALL-E Trading Bots</h1>
            <p className="text-walle-beige">Create, manage, and monitor your automated trading bots</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-walle-beige">Live Updates</span>
              <StatusPill status={isConnected ? 'connected' : 'disconnected'} />
            </div>
            <Link href="/"><Button variant="secondary">Back to Home</Button></Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-walle-darkgray border-walle-rust">
            <div className="text-sm text-walle-beige mb-1">Total Bots</div>
            <div className="text-3xl font-bold text-walle-yellow">{totalBots}</div>
          </Card>
          <Card className="p-6 bg-walle-darkgray border-walle-rust">
            <div className="text-sm text-walle-beige mb-1">Active Bots</div>
            <div className="text-3xl font-bold text-green-400">{activeBots}</div>
          </Card>
          <Card className="p-6 bg-walle-darkgray border-walle-rust">
            <div className="text-sm text-walle-beige mb-1">Inactive Bots</div>
            <div className="text-3xl font-bold text-gray-400">{totalBots - activeBots}</div>
          </Card>
          <Card className="p-6 bg-walle-darkgray border-walle-rust">
            <div className="text-sm text-walle-beige mb-1">Strategies</div>
            <div className="text-3xl font-bold text-walle-orange">{strategies.length}</div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Link href="/bots/create" className="flex-1">
            <Button variant="primary" className="w-full bg-walle-yellow text-walle-brown hover:bg-walle-orange font-bold text-lg py-4">
              🤖 Create New WALL-E Bot
            </Button>
          </Link>
          <Button 
            onClick={() => setShowCreateForm(true)} 
            variant="secondary"
            className="px-8"
          >
            ⚡ Quick Create
          </Button>
        </div>

        {/* Create Bot Form */}
        {showCreateForm && (
          <Card className="p-6 mb-8 bg-walle-darkgray border-walle-rust">
            <h2 className="text-xl font-semibold text-walle-yellow mb-4">Quick Create Bot</h2>
            <form onSubmit={handleCreateBot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-walle-beige mb-2">Bot Name</label>
                <input
                  type="text"
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                  placeholder="Enter bot name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-walle-beige mb-2">Strategy</label>
                <select
                  value={newBot.strategyId}
                  onChange={(e) => setNewBot({ ...newBot, strategyId: e.target.value })}
                  className="w-full p-3 bg-walle-darkblue border border-walle-rust rounded text-white focus:border-walle-yellow focus:outline-none"
                  required
                >
                  <option value="">Select a strategy</option>
                  {strategies.map(strategy => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4">
                <Button type="submit" variant="primary" className="bg-walle-yellow text-walle-brown hover:bg-walle-orange">
                  Create Bot
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Bots List */}
        <Card className="p-6 bg-walle-darkgray border-walle-rust">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-walle-yellow">Your Bots ({bots.length})</h2>
            {bots.length > 0 && (
              <div className="text-sm text-walle-beige">
                {activeBots} running • {totalBots - activeBots} stopped
              </div>
            )}
          </div>
          
          {bots.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-xl text-walle-beige mb-2">No bots created yet</p>
              <p className="text-sm text-gray-400 mb-6">Create your first WALL-E bot to start automated trading</p>
              <Link href="/bots/create">
                <Button variant="primary" className="bg-walle-yellow text-walle-brown hover:bg-walle-orange font-bold">
                  🚀 Create Your First Bot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bots.map(bot => {
                const strategy = strategies.find(s => s.id === bot.strategyId);
                const activity = liveActivity[bot.id];
                const hasRecentActivity = activity && (Date.now() - activity.timestamp < 5000);
                
                return (
                  <div 
                    key={bot.id} 
                    className={`p-6 rounded-lg border-2 transition-all ${
                      bot.active 
                        ? 'bg-walle-darkblue border-walle-yellow' 
                        : 'bg-walle-brown border-walle-rust'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-2xl">{bot.active ? '🟢' : '⚫'}</div>
                          <h3 className="text-xl font-bold text-walle-yellow">{bot.name}</h3>
                          <StatusPill 
                            status={bot.active ? 'active' : 'inactive'}
                          />
                          {hasRecentActivity && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded animate-pulse">
                              ⚡ Live
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-walle-beige mb-1">Strategy</div>
                            <div className="text-sm font-semibold text-white">
                              {strategy?.name || 'Unknown'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-walle-beige mb-1">Created</div>
                            <div className="text-sm font-semibold text-white">
                              {new Date(bot.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {strategy?.description && (
                          <p className="text-sm text-walle-beige mb-4">
                            {strategy.description}
                          </p>
                        )}

                        {activity && hasRecentActivity && (
                          <div className="mt-4 p-3 bg-walle-darkblue rounded border border-walle-rust">
                            <div className="text-xs text-walle-beige mb-1">Recent Activity</div>
                            <div className="text-sm text-white">
                              {activity.action || 'Trading activity detected'} • {' '}
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {bot.active ? (
                          <Button 
                            onClick={() => toggleBot(bot.id, bot.active)} 
                            variant="danger" 
                            size="sm"
                            className="font-semibold"
                          >
                            ⏹️ Stop Bot
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => toggleBot(bot.id, bot.active)} 
                            variant="primary" 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 font-semibold"
                          >
                            ▶️ Start Bot
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          ⚙️ Configure
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          📊 View Stats
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


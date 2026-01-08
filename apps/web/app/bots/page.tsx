'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Api } from '../lib/api';
import { Button, Card, StatusPill, Skeleton } from '@task/ui';

export default function BotsPage() {
  const [bots, setBots] = useState<Awaited<ReturnType<typeof Api.bots.list>>>([]);
  const [strategies, setStrategies] = useState<Awaited<ReturnType<typeof Api.strategies.list>>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBot, setNewBot] = useState({ name: '', strategyId: '' });

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
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-72 bg-gray-700 rounded" />
            </div>
            <div className="h-9 w-28 bg-gray-700 rounded" />
          </div>
          <Card className="p-6">
            <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trading Bots</h1>
            <p className="text-gray-400">Create, manage, and monitor your trading bots</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/bots/create">
              <Button variant="primary" className="bg-walle-yellow text-walle-brown hover:bg-walle-orange">
                🤖 Create WALL-E Bot
              </Button>
            </Link>
            <Button onClick={() => setShowCreateForm(true)} variant="secondary">Quick Create</Button>
            <Link href="/"><Button variant="secondary">Back to Home</Button></Link>
          </div>
        </div>

        {/* Create Bot Form */}
        {showCreateForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Bot</h2>
            <form onSubmit={handleCreateBot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bot Name</label>
                <input
                  type="text"
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter bot name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Strategy</label>
                <select
                  value={newBot.strategyId}
                  onChange={(e) => setNewBot({ ...newBot, strategyId: e.target.value })}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
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
                <Button type="submit" variant="primary">Create Bot</Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Bots List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Bots ({bots.length})</h2>
          {bots.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No bots created yet</p>
              <Button onClick={() => setShowCreateForm(true)} className="mt-4" variant="primary">Create Your First Bot</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bots.map(bot => {
                const strategy = strategies.find(s => s.id === bot.strategyId);
                return (
                  <div key={bot.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{bot.name}</h3>
                          <StatusPill status={bot.active ? 'active' : 'inactive'} />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                          Strategy: {strategy?.name || 'Unknown'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Created: {new Date(bot.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {bot.active ? (
                          <Button onClick={() => toggleBot(bot.id, bot.active)} variant="danger" size="sm">Stop</Button>
                        ) : (
                          <Button onClick={() => toggleBot(bot.id, bot.active)} variant="primary" size="sm">Start</Button>
                        )}
                        <Button variant="outline" size="sm">Edit</Button>
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

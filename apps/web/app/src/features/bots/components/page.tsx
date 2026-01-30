import React from 'react';
import { BotList } from '../../features/bots/components/BotList';

export default function BotsPage() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bot Dashboard</h1>
          <p className="text-gray-400">Manage your active trading algorithms and view performance metrics.</p>
        </header>
        <BotList />
      </div>
    </main>
  );
}
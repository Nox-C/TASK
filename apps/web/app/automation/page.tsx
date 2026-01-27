'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BotTable } from '@/components/BotTable';
import { KPICards } from '@/components/KPICards';
import { PerformanceChart } from '@/components/PerformanceChart';
import { CreateBotModal } from '@/components/CreateBotModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AutomationPage() {
  const [bots, setBots] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchBots = async () => {
    const { data } = await axios.get(`${API_URL}/bots`);
    setBots(data);
  };

  const fetchMetrics = async () => {
    const { data } = await axios.get(`${API_URL}/bots/metrics`);
    setMetrics(data);
  };

  useEffect(() => {
    fetchBots();
    fetchMetrics();
  }, []);

  const handleCreateBot = async (botData: any) => {
    await axios.post(`${API_URL}/bots`, botData);
    fetchBots();
    fetchMetrics();
    setShowCreateModal(false);
  };

  const handleStartBot = async (id: number) => {
    await axios.post(`${API_URL}/bots/${id}/start`);
    fetchBots();
    fetchMetrics();
  };

  const handleStopBot = async (id: number) => {
    await axios.post(`${API_URL}/bots/${id}/stop`);
    fetchBots();
    fetchMetrics();
  };

  const handleDeleteBot = async (id: number) => {
    await axios.delete(`${API_URL}/bots/${id}`);
    fetchBots();
    fetchMetrics();
  };

  return (
    <div className="min-h-screen p-8 bg-walle-darkblue">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-walle-yellow">
          🤖 WALL-E Trading Control Panel
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-walle-yellow text-black font-semibold rounded-lg hover:bg-yellow-500"
          >
            Create Bot
          </button>
          <button
            onClick={() => { fetchBots(); fetchMetrics(); }}
            className="px-6 py-3 bg-walle-lightblue text-white rounded-lg hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && <KPICards metrics={metrics} />}

      {/* Performance Chart */}
      <PerformanceChart />

      {/* Bots Table */}
      <BotTable
        bots={bots}
        onStart={handleStartBot}
        onStop={handleStopBot}
        onDelete={handleDeleteBot}
      />

      {/* Create Bot Modal */}
      {showCreateModal && (
        <CreateBotModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBot}
        />
      )}
    </div>
  );
}

'use client';

import { BacktestResult, GridBot } from '../../../shared/types/trading';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Bot API Service - Handles all bot-related API calls
export class BotApiService {
  // Fetch all bots
  static async fetchBots(): Promise<GridBot[]> {
    const response = await fetch(`${API_BASE_URL}/automation/bots`);
    if (!response.ok) {
      throw new Error('Failed to fetch bots');
    }
    return await response.json();
  }

  // Create a new bot
  static async createBot(botData: Partial<GridBot>): Promise<GridBot> {
    const response = await fetch(`${API_BASE_URL}/automation/bots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create bot');
    }
    
    return await response.json();
  }

  // Update existing bot
  static async updateBot(botId: string, botData: Partial<GridBot>): Promise<GridBot> {
    const response = await fetch(`${API_BASE_URL}/automation/bots/${botId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update bot');
    }
    
    return await response.json();
  }

  // Delete a bot
  static async deleteBot(botId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/automation/bots/${botId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete bot');
    }
  }

  // Start bot execution
  static async startBot(botId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/automation/bots/${botId}/start`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to start bot');
    }
  }

  // Stop bot execution
  static async stopBot(botId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/automation/bots/${botId}/stop`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to stop bot');
    }
  }

  // Run backtest
  static async runBacktest(botId: string, startDate: string, endDate: string): Promise<BacktestResult> {
    const response = await fetch(`${API_BASE_URL}/automation/bots/${botId}/backtest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to run backtest');
    }
    
    return await response.json();
  }
}

// Export singleton instance for easy usage
export const botApi = BotApiService;

'use client';

import { useEffect, useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';


interface EVEIconProps {
  status?: 'running' | 'stopped' | 'error' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  botId?: string; // Connect to specific bot for real-time updates
}

export function EVEIcon({ status = 'stopped', size = 'md', className = '', botId }: EVEIconProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Get bot status from Zustand store if botId is provided
  const activeBot = useTradeStore((state: any) => state.activeBot);
  
  useEffect(() => {
    if (botId && activeBot?.id === botId) {
      // Update status based on active bot from store
      const newStatus = activeBot.status === 'RUNNING' ? 'running' : 
                       activeBot.status === 'STOPPED' ? 'stopped' : 'error';
      
      if (newStatus !== currentStatus) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentStatus(newStatus);
          setIsTransitioning(false);
        }, 150);
      }
    }
  }, [activeBot, botId, currentStatus]);
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const statusColors = {
    running: 'bg-success animate-eve-glow',
    stopped: 'bg-gray-400',
    error: 'bg-alert animate-pulse',
    pending: 'bg-warning animate-pulse-slow'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* EVE's Body - Sleek white oval */}
      <div className="absolute inset-0 bg-eve-white rounded-full shadow-lg">
        {/* EVE's Eye Display - Dynamic status indicator */}
        <div className={`absolute inset-1 ${statusColors[status]} rounded-full flex items-center justify-center transition-all duration-300`}>
          {/* Inner eye detail */}
          <div className="w-1/2 h-1/2 bg-eve-white rounded-full opacity-80"></div>
        </div>
        
        {/* EVE's Blue Light Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-eve-blue opacity-60"></div>
        
        {/* Status-specific glow effects */}
        {status === 'running' && (
          <div className="absolute inset-0 rounded-full bg-success opacity-20 animate-pulse-slow"></div>
        )}
        
        {status === 'error' && (
          <div className="absolute inset-0 rounded-full bg-alert opacity-30 animate-pulse"></div>
        )}
      </div>
    </div>
  );
}

// Animated EVE Icon for active bots
export function AnimatedEVEIcon({ status = 'running', size = 'md', className = '' }: EVEIconProps) {
  return (
    <div className={`${className} relative`}>
      <EVEIcon status={status} size={size} />
      
      {/* Scanning animation effect */}
      {status === 'running' && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full border border-eve-blue animate-ping opacity-30"></div>
        </div>
      )}
      
      {/* Status change animation */}
      <div className="absolute inset-0 rounded-full animate-status-transition opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="w-full h-full bg-gradient-to-r from-eve-blue to-success rounded-full opacity-30"></div>
      </div>
    </div>
  );
}

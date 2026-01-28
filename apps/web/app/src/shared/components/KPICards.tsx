'use client';

import { motion } from 'framer-motion';

// Wall-E image paths
const wallEImages = [
  '/assets/wall-e/walle-icon.png',
  '/assets/wall-e/walle-icon2.png',
  '/assets/wall-e/Noctuline-Wall-E-Wall-E.512.png',
  '/assets/wall-e/png-clipart-eve-wii-wall-E-s-cartoons-cartoon-thumbnail.png'
];

export function KPICards({ metrics }: any) {
  const kpiData = [
    {
      title: "Total Portfolio",
      value: "$125,430",
      change: 12.5,
      wallEImage: wallEImages[0],
      trend: 'up',
      gradient: "from-green-400 to-emerald-600"
    },
    {
      title: "Active Bots",
      value: metrics.totalBots,
      change: 25,
      wallEImage: wallEImages[1],
      trend: 'up',
      gradient: "from-blue-400 to-cyan-600"
    },
    {
      title: "24h P&L",
      value: `+$${metrics.totalPnl.toFixed(2)}`,
      change: 8.3,
      wallEImage: wallEImages[2],
      trend: metrics.totalPnl >= 0 ? 'up' : 'down',
      gradient: metrics.totalPnl >= 0 ? "from-purple-400 to-pink-600" : "from-red-400 to-orange-600"
    },
    {
      title: "Win Rate",
      value: `${metrics.winRate}%`,
      change: -2.1,
      wallEImage: wallEImages[3],
      trend: 'down',
      gradient: "from-orange-400 to-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            scale: 1.02, 
            boxShadow: '0 20px 40px rgba(255,184,0,0.3)' 
          }}
          className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 overflow-hidden group"
        >
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
          
          {/* Wall-E Image Background */}
          <div 
            className="absolute right-0 bottom-0 w-20 h-20 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
            style={{
              backgroundImage: `url(${kpi.wallEImage})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              filter: 'blur(1px)'
            }}
          />
          
          {/* Floating particles */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-walle-yellow rounded-full animate-ping" />
          <div className="absolute bottom-2 left-2 w-1 h-1 bg-walle-lightblue rounded-full animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-300 text-sm font-medium mb-1">{kpi.title}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12"
                style={{
                  backgroundImage: `url(${kpi.wallEImage})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                kpi.trend === 'up' ? 'bg-green-500/30' : 'bg-red-500/30'
              }`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full ${
                    kpi.trend === 'up' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                />
              </div>
              <span className={`text-sm font-bold ${
                kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {kpi.trend === 'up' ? '↑' : '↓'} {Math.abs(kpi.change)}%
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

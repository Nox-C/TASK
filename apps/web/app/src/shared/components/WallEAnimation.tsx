import React, { useEffect, useState } from 'react';

interface WallEAnimationProps {
  type?: 'idle' | 'working' | 'happy' | 'searching';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const WallEAnimation: React.FC<WallEAnimationProps> = ({ 
  type = 'idle',
  size = 'md',
  className = ''
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const getAnimationClass = () => {
    switch (type) {
      case 'working':
        return 'animate-rotate-slow';
      case 'happy':
        return 'animate-bounce';
      case 'searching':
        return 'animate-pulse-slow';
      default:
        return 'animate-blink-slow';
    }
  };

  return (
    <div className={`${sizeClasses[size]} ${getAnimationClass()} ${className} relative`}>
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: 'url(/wall-e-icon.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: frame % 2 === 0 ? 'brightness(1)' : 'brightness(1.1)'
        }}
        role="img"
        aria-label={`WALL-E Robot - ${type} animation`}
      />
      {type === 'working' && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallEAnimation;

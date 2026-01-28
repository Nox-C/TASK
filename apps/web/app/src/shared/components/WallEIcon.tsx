import React from 'react';

interface WallEIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const WallEIcon: React.FC<WallEIconProps> = ({ 
  size = 'md', 
  className = '', 
  animate = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const animationClass = animate ? 'animate-pulse' : '';

  return (
    <div 
      className={`${sizeClasses[size]} ${animationClass} ${className}`}
      style={{
        backgroundImage: 'url(/wall-e-icon.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
      role="img"
      aria-label="WALL-E Robot Icon"
    />
  );
};

export default WallEIcon;

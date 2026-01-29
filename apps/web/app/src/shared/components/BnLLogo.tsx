'use client';


interface BnLLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon-only';
  className?: string;
}

export function BnLLogo({ size = 'md', variant = 'full', className = '' }: BnLLogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };

  if (variant === 'icon-only') {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        {/* BnL Icon - Using actual SVG */}
        <img 
          src="/bnl-logo.svg" 
          alt="Buy n Large Logo" 
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
        />
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center space-x-2`}>
      {/* BnL Logo Block */}
      <div className={`${sizeClasses[size]} bg-bnl-red rounded flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 overflow-hidden`}>
        <img 
          src="/bnl-logo.svg" 
          alt="Buy n Large Logo" 
          className="w-full h-full object-contain p-1"
        />
      </div>
      
      {/* BnL Text */}
      <div className={`${textSizes[size]} text-eve-white font-light tracking-wider`}>
        BUY n LARGE
      </div>
    </div>
  );
}

// Footer version with corporate styling
export function BnLFooter({ className = '' }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center space-x-4 py-4 border-t border-walle-surface/20`}>
      <BnLLogo size="sm" variant="icon-only" />
      <div className="text-xs text-gray-400">
        © 2801 Buy n Large Corp. • All Rights Reserved
      </div>
      <div className="text-xs text-walle-yellow">
        Trading Automation Division
      </div>
    </div>
  );
}

// Header version for navigation
export function BnLHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-between`}>
      <BnLLogo size="md" />
      <div className="text-xs text-eve-white/60">
        Axiom Trading Platform v2.0
      </div>
    </div>
  );
}

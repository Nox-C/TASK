"use client";

interface ChangeIndicatorProps {
  value: number;
  percentage?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChangeIndicator({
  value,
  percentage = false,
  showIcon = true,
  size = "sm",
  className = "",
}: ChangeIndicatorProps) {
  const isPositive = value >= 0;
  const displayValue = Math.abs(value);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const formatValue = () => {
    if (percentage) {
      return `${displayValue.toFixed(2)}%`;
    }
    return displayValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const colorClass = isPositive ? "text-walle-green" : "text-walle-orange";
  const icon = isPositive ? "↑" : "↓";

  return (
    <span
      className={`${sizeClasses[size]} ${colorClass} font-medium flex items-center gap-1 ${className}`}
    >
      {showIcon && <span className={iconSizes[size]}>{icon}</span>}
      <span>
        {isPositive ? "+" : ""}
        {formatValue()}
      </span>
    </span>
  );
}

// Utility function to calculate percentage change
export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// Utility function to determine change direction
export function getChangeDirection(
  current: number,
  previous: number,
): "up" | "down" | "neutral" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}

import React from "react";

// Utility to merge class names
export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

// Button component with variants and sizes
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "danger"
    | "ghost"
    | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "default",
  size = "md",
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-white/5 text-gray-200",
    outline: "border border-gray-600 hover:bg-white/5 text-gray-200",
  };
  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    />
  );
};

// Card component with subtle/elevated variants
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "subtle" | "elevated" | "solid";
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "subtle",
  ...props
}) => {
  const variants: Record<NonNullable<CardProps["variant"]>, string> = {
    subtle: "bg-gray-800/80 backdrop-blur border border-gray-700",
    elevated:
      "bg-gray-800/90 backdrop-blur border border-gray-700 shadow-elevated",
    solid: "bg-gray-800 border border-gray-700",
  };
  return (
    <div
      className={cn("rounded-xl", variants[variant], className)}
      {...props}
    />
  );
};

// Badge component with statuses
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  ...props
}) => {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-gray-700 text-gray-100 border border-gray-600",
    success: "bg-green-500/20 text-green-300 border border-green-600/40",
    warning: "bg-yellow-500/20 text-yellow-200 border border-yellow-600/40",
    danger: "bg-red-500/20 text-red-300 border border-red-600/40",
    info: "bg-blue-500/20 text-blue-300 border border-blue-600/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
};

// Status pill specialized for health and connectivity
export type StatusKind =
  | "success"
  | "error"
  | "pending"
  | "healthy"
  | "degraded"
  | "down"
  | "connected"
  | "disconnected"
  | "active"
  | "inactive";

export const StatusPill: React.FC<{
  status: StatusKind;
  className?: string;
}> = ({ status, className }) => {
  const map: Record<StatusKind, string> = {
    success: "bg-green-500/20 text-green-300 border border-green-600/30",
    error: "bg-red-500/20 text-red-300 border border-red-600/30",
    pending: "bg-yellow-500/20 text-yellow-300 border border-yellow-600/30",
    healthy: "bg-green-500/20 text-green-400 border border-green-600/30",
    degraded: "bg-yellow-500/20 text-yellow-300 border border-yellow-600/30",
    down: "bg-red-500/20 text-red-400 border border-red-600/30",
    connected: "bg-green-500/20 text-green-400 border border-green-600/30",
    disconnected: "bg-red-500/20 text-red-400 border border-red-600/30",
    active: "bg-green-500/20 text-green-300 border border-green-600/30",
    inactive: "bg-gray-600/30 text-gray-300 border border-gray-600/50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        map[status],
        className,
      )}
    >
      {status}
    </span>
  );
};

// KPI Card with accent gradient and slot for sparkline
export interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "blue" | "green" | "yellow" | "purple" | "red" | "cyan";
  rightSlot?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  hint,
  accent = "blue",
  rightSlot,
  footer,
  className,
}) => {
  const accents: Record<NonNullable<KpiCardProps["accent"]>, string> = {
    blue: "from-blue-800 to-blue-600 border-blue-500/40",
    green: "from-green-800 to-green-600 border-green-500/40",
    yellow: "from-yellow-800 to-yellow-600 border-yellow-500/40",
    purple: "from-purple-800 to-purple-600 border-purple-500/40",
    red: "from-red-800 to-red-600 border-red-500/40",
    cyan: "from-cyan-800 to-cyan-600 border-cyan-500/40",
  };
  return (
    <div
      className={cn(
        "rounded-xl p-6 border shadow-elevated bg-gradient-to-br",
        accents[accent],
        className,
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        {rightSlot}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {hint && <div className="text-xs text-gray-300 mt-1">{hint}</div>}
      {footer && <div className="mt-3 text-xs text-gray-400">{footer}</div>}
    </div>
  );
};

// Skeleton loader
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  rounded = "md",
  ...props
}) => {
  const radius: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };
  return (
    <div
      className={cn("animate-pulse bg-gray-700/60", radius[rounded], className)}
      {...props}
    />
  );
};

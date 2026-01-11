import React from 'react'

// Utility to merge class names
export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ')
}

// Button component with variants and sizes
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'md',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-walle-gray-900 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95'
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    default: 'bg-walle-gray-700 hover:bg-walle-gray-600 text-walle-gray-100 border border-walle-gray-600/50 hover:border-walle-yellow-500/50',
    primary: 'bg-gradient-to-r from-walle-yellow-600 to-walle-yellow-500 hover:from-walle-yellow-500 hover:to-walle-orange-500 text-white shadow-lg hover:shadow-xl hover:shadow-walle-yellow-500/25',
    secondary: 'bg-walle-gray-800 hover:bg-walle-gray-700 text-walle-gray-100 border border-walle-gray-700 hover:border-walle-gray-600',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25',
    ghost: 'bg-transparent hover:bg-walle-gray-800/50 text-walle-gray-200 hover:text-walle-yellow-400',
    outline: 'border border-walle-gray-600 hover:bg-walle-gray-800/50 hover:border-walle-yellow-500 text-walle-gray-200 hover:text-walle-yellow-400',
  }
  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled} {...props} />
  )
}

// Card component with subtle/elevated variants
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'elevated' | 'solid'
}

export const Card: React.FC<CardProps> = ({ className, variant = 'subtle', ...props }) => {
  const variants: Record<NonNullable<CardProps['variant']>, string> = {
    subtle: 'bg-walle-gray-800/80 backdrop-blur-sm border border-walle-gray-700/50 hover:border-walle-yellow-500/30 transition-all duration-300',
    elevated: 'bg-gradient-to-br from-walle-gray-800/90 to-walle-gray-900/90 backdrop-blur border border-walle-gray-700/50 shadow-2xl hover:shadow-walle-yellow-500/10 hover:border-walle-yellow-500/40 transition-all duration-300',
    solid: 'bg-walle-gray-800 border border-walle-gray-700 hover:border-walle-gray-600 transition-colors duration-200',
  }
  return <div className={cn('rounded-xl', variants[variant], className)} {...props} />
}

// Badge component with statuses
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-walle-gray-700/80 text-walle-gray-100 border border-walle-gray-600/50 backdrop-blur-sm',
    success: 'bg-walle-green-500/20 text-walle-green-300 border border-walle-green-500/40 backdrop-blur-sm shadow-sm shadow-walle-green-500/20',
    warning: 'bg-walle-yellow-500/20 text-walle-yellow-300 border border-walle-yellow-500/40 backdrop-blur-sm shadow-sm shadow-walle-yellow-500/20',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/40 backdrop-blur-sm shadow-sm shadow-red-500/20',
    info: 'bg-walle-blue-500/20 text-walle-blue-300 border border-walle-blue-500/40 backdrop-blur-sm shadow-sm shadow-walle-blue-500/20',
  }
  return (
    <span className={cn('inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold', variants[variant], className)} {...props} />
  )
}

// Status pill specialized for health and connectivity
export type StatusKind = 'healthy' | 'degraded' | 'down' | 'connected' | 'disconnected' | 'active' | 'inactive'

export const StatusPill: React.FC<{ status: StatusKind; className?: string }> = ({ status, className }) => {
  const map: Record<StatusKind, string> = {
    healthy: 'bg-walle-green-500/20 text-walle-green-300 border border-walle-green-500/40 shadow-sm shadow-walle-green-500/20',
    degraded: 'bg-walle-yellow-500/20 text-walle-yellow-300 border border-walle-yellow-500/40 shadow-sm shadow-walle-yellow-500/20',
    down: 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/20',
    connected: 'bg-walle-green-500/20 text-walle-green-300 border border-walle-green-500/40 shadow-sm shadow-walle-green-500/20',
    disconnected: 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/20',
    active: 'bg-walle-green-500/20 text-walle-green-300 border border-walle-green-500/40 shadow-sm shadow-walle-green-500/20',
    inactive: 'bg-walle-gray-600/30 text-walle-gray-300 border border-walle-gray-600/50',
  }
  return <span className={cn('inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm', map[status], className)}>{status}</span>
}

// KPI Card with accent gradient and slot for sparkline
export interface KpiCardProps {
  title: string
  value: React.ReactNode
  hint?: string
  accent?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'cyan'
  rightSlot?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, hint, accent = 'blue', rightSlot, footer, className }) => {
  const accents: Record<NonNullable<KpiCardProps['accent']>, string> = {
    blue: 'from-walle-blue-800/90 to-walle-blue-700/90 border-walle-blue-500/40 shadow-walle-blue-500/20',
    green: 'from-walle-green-800/90 to-walle-green-700/90 border-walle-green-500/40 shadow-walle-green-500/20',
    yellow: 'from-walle-yellow-800/90 to-walle-yellow-700/90 border-walle-yellow-500/40 shadow-walle-yellow-500/20',
    purple: 'from-purple-800/90 to-purple-700/90 border-purple-500/40 shadow-purple-500/20',
    red: 'from-red-800/90 to-red-700/90 border-red-500/40 shadow-red-500/20',
    cyan: 'from-cyan-800/90 to-cyan-700/90 border-cyan-500/40 shadow-cyan-500/20',
  }
  return (
    <div className={cn('rounded-xl p-6 border shadow-2xl bg-gradient-to-br backdrop-blur-sm hover:shadow-xl transition-all duration-300', accents[accent], className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-walle-gray-200">{title}</h3>
        {rightSlot}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {hint && <div className="text-xs text-walle-gray-300 mt-1">{hint}</div>}
      {footer && <div className="mt-3 text-xs text-walle-gray-400">{footer}</div>}
    </div>
  )
}

// Skeleton loader
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded = 'md', ...props }) => {
  const radius: Record<NonNullable<SkeletonProps['rounded']>, string> = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }
  return (
    <div
      className={cn('animate-pulse bg-walle-gray-700/60 backdrop-blur-sm', radius[rounded], className)}
      {...props}
    />
  )
}

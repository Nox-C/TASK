import { cn } from '@task/ui';
import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: string;
  className?: string;
}

export function Card({ className, title, description, footer, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl p-6 border shadow-elevated bg-gray-800', className)}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        </div>
      )}
      {children}
      {footer && (
        <div className="mt-3 text-xs text-gray-400">{footer}</div>
      )}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-700', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  );
}

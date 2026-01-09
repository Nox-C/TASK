import { cn } from '@task/ui';
import React from 'react';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  className?: string;
}

export function Tabs({ defaultValue, className, children, ...props }: TabsProps) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <ul className={cn('flex space-x-1', className)} {...props}>
      {children}
    </ul>
  );
}

export interface TabsTriggerProps extends React.HTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  className?: string;
}

export function TabsTrigger({ active, className, children, ...props }: TabsTriggerProps) {
  return (
    <a
      className={cn(
        'block px-3 py-2 text-sm font-medium rounded-md',
        active ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function TabsContent({ className, children, ...props }: TabsContentProps) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

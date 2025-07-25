import React from 'react';
import { cn } from '@/lib/utils';

interface StickyTableWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const StickyTableWrapper = ({ 
  children, 
  className,
  maxHeight = '600px'
}: StickyTableWrapperProps) => {
  return (
    <div 
      className={cn(
        "relative overflow-auto border rounded-md bg-card",
        "sticky-table-container",
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
};
import React, { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ShimmerProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

export function Shimmer({
  children,
  as: Component = 'span',
  className,
  duration = 2,
  spread = 2,
}: ShimmerProps) {
  return (
    <Component
      className={cn(
        'relative inline-block bg-clip-text',
        className
      )}
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          currentColor 0%,
          currentColor ${40 - spread * 5}%,
          rgba(148, 163, 184, 0.6) 50%,
          currentColor ${60 + spread * 5}%,
          currentColor 100%
        )`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: `shimmer ${duration}s ease-in-out infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </Component>
  );
}

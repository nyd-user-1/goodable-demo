import React from 'react';
import { Heart } from 'lucide-react';

interface MorphingHeartLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  beats?: number;
}

export const MorphingHeartLoader: React.FC<MorphingHeartLoaderProps> = ({ 
  className = '', 
  size = 'md',
  beats = 2 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Main heart with glow */}
        <Heart 
          className={`${sizeClasses[size]} text-red-500 animate-pulse drop-shadow-lg`}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))',
            animationDuration: '1s',
            animationIterationCount: beats === Infinity ? 'infinite' : beats
          }}
        />
        
        {/* Subtle scale effect */}
        <Heart 
          className={`${sizeClasses[size]} text-red-400 absolute inset-0 animate-ping opacity-20`}
          style={{
            animationDuration: '2s',
            animationIterationCount: beats === Infinity ? 'infinite' : Math.ceil(beats / 2)
          }}
        />
      </div>
    </div>
  );
};
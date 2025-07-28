import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MorphingHeartLoader } from './MorphingHeartLoader';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Route complexity mapping for intelligent timing
const routeComplexity = {
  '/dashboard': 'complex',
  '/bills': 'complex', 
  '/members': 'complex',
  '/committees': 'complex',
  '/chats': 'medium',
  '/playground': 'medium',
  '/profile': 'simple',
  '/plans': 'simple',
  '/favorites': 'simple',
} as const;

// Timing configurations based on complexity
const timingConfig = {
  simple: { fadeOut: 200, heart: 300, fadeIn: 250 },
  medium: { fadeOut: 250, heart: 400, fadeIn: 300 },
  complex: { fadeOut: 300, heart: 500, fadeIn: 350 },
};

type TransitionStage = 'idle' | 'fadeOutRight' | 'heartLoader' | 'fadeInLeft';

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<TransitionStage>('idle');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const motionReducedRef = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    motionReducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Clear any existing transitions on mount
  useEffect(() => {
    setTransitionStage('idle');
    setIsTransitioning(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // If reduced motion, just crossfade instantly
      if (motionReducedRef.current) {
        setDisplayLocation(location);
        return;
      }

      setIsTransitioning(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Determine timing based on destination route complexity
      const destinationComplexity = routeComplexity[location.pathname as keyof typeof routeComplexity] || 'medium';
      const timing = timingConfig[destinationComplexity];

      // Stage 1: Fade out right with scale
      setTransitionStage('fadeOutRight');
      
      timeoutRef.current = setTimeout(() => {
        // Stage 2: Show heart loader
        setTransitionStage('heartLoader');
        
        // Start preloading new page during heart phase
        setDisplayLocation(location);
        
        timeoutRef.current = setTimeout(() => {
          // Stage 3: Fade in left with parallax
          setTransitionStage('fadeInLeft');
          
          timeoutRef.current = setTimeout(() => {
            // Complete transition
            setTransitionStage('idle');
            setIsTransitioning(false);
          }, timing.fadeIn);
        }, timing.heart);
      }, timing.fadeOut);
    }
  }, [location.pathname, displayLocation.pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Get transform and opacity based on transition stage
  const getTransitionStyles = () => {
    switch (transitionStage) {
      case 'fadeOutRight':
        return {
          transform: 'translateX(100px) scale(0.95)',
          opacity: 0,
          filter: 'blur(2px)',
        };
      case 'heartLoader':
        return {
          transform: 'translateX(100px) scale(0.95)', 
          opacity: 0,
          filter: 'blur(2px)',
        };
      case 'fadeInLeft':
        return {
          transform: 'translateX(-50px) scale(1.02)',
          opacity: 0,
          filter: 'blur(1px)',
        };
      case 'idle':
      default:
        return {
          transform: 'translateX(0) scale(1)',
          opacity: 1,
          filter: 'blur(0)',
        };
    }
  };

  return (
    <>
      {/* Main content with sophisticated transitions */}
      <div
        className="transition-all duration-300 ease-out"
        style={{
          willChange: 'transform, opacity, filter',
          ...getTransitionStyles(),
        }}
      >
        {children}
      </div>

      {/* Heart loader overlay */}
      {transitionStage === 'heartLoader' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
          <div className="animate-in zoom-in duration-200">
            <MorphingHeartLoader size="lg" beats={2} />
          </div>
        </div>
      )}
    </>
  );
};
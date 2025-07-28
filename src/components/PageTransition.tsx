import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("slideIn");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing transitions on mount
  useEffect(() => {
    // Force clear any cached transition states
    setTransitionStage("slideIn");
    setIsTransitioning(false);
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      setTransitionStage("slideUp");
      
      // Clear any existing timeout to prevent conflicts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // After old page slides up, update location and slide new page in from below
      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("slideIn");
        
        // Complete transition
        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 400);
      }, 400);
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

  return (
    <div
      className={`h-full w-full transition-transform duration-[400ms] ease-out ${
        transitionStage === "slideUp" 
          ? "transform -translate-y-full" 
          : transitionStage === "slideIn"
          ? "transform translate-y-0"
          : "transform translate-y-full"
      }`}
      style={{
        willChange: 'transform',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
};
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      setTransitionStage("fadeOut");
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // After fade out completes, update location and fade in
      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
        
        // Allow fade in to complete
        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  }, [location.pathname, displayLocation.pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-in-out transform ${
        transitionStage === "fadeOut" 
          ? "opacity-0 scale-[0.98]" 
          : "opacity-100 scale-100"
      }`}
      style={{
        transformOrigin: 'center center',
      }}
    >
      {children}
    </div>
  );
};
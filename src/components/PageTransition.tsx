import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // Start transition
      setIsTransitioning(true);
      
      // Update content after a brief delay
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        
        // End transition after content updates
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`transition-opacity duration-150 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
};
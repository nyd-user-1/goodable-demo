import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MorphingHeartLoader } from './MorphingHeartLoader';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      
      // Show heart loader briefly then fade to new content
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, displayLocation.pathname]);

  return (
    <>
      {/* Main content with simple fade transition */}
      <div
        className={`transition-opacity duration-200 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>

      {/* Heart loader overlay - only shows during transition */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <MorphingHeartLoader size="md" beats={1} />
        </div>
      )}
    </>
  );
};
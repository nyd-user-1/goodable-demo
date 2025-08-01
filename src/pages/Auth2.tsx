import React, { useState, useEffect } from 'react';
import { SignupOnlyForm } from "@/components/signup-only-form";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Auth2: React.FC = () => {
  // Carousel data with images and quotes (first two must be as specified)
  const carouselData = [
    {
      image: '/goodable-night.avif', // Using known working local image
      quote: "It has meaning if you give it meaning."
    },
    {
      image: '/goodable-path.avif', // Using known working local image
      quote: "Both, it's always both."
    },
    {
      image: '/goodable-botanical.avif', // Using known working local image
      quote: "Retweets are easy. Real change is not."
    },
    {
      image: '/goodable-dandelion.avif', // Using known working local image
      quote: "Not left. Not right. Just forward."
    },
    {
      image: '/goodable-dream-state.avif', // Using known working local image
      quote: "Big voice? Big following? Big deal. Be big."
    },
    {
      image: '/goodable-heart.avif', // Using known working local image
      quote: "It's not about sides—it's about systems."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Debug: Test if images are loading
  useEffect(() => {
    carouselData.forEach((item, index) => {
      const img = new Image();
      img.onload = () => console.log(`Image ${index} loaded successfully:`, item.image);
      img.onerror = () => console.error(`Image ${index} failed to load:`, item.image);
      img.src = item.image;
    });
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselData.length);
        setTimeout(() => setIsAnimating(false), 1000); // Allow fade in to complete
      }, 500); // Fade out duration
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background relative z-20">
        <ScrollProgress className="top-0" />
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 lg:p-8">
          <a href="/" className="flex items-center gap-2 font-medium text-foreground">
            ❤️ Goodable
          </a>
          <a 
            href="/auth" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </a>
        </div>
        
        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-sm space-y-6">
            <SignupOnlyForm />
          </div>
        </div>
      </div>
      
      {/* Right side - Image carousel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Image container with slide animation */}
        <div className="relative h-full">
          {carouselData.map((item, index) => {
            const isActive = index === currentIndex;
            
            return (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              >
                <img 
                  src={item.image}
                  alt={`Slide ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  onError={(e) => {
                    console.error(`Failed to load image: ${item.image}`);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              
              
              {/* Subtle overlay just at bottom for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent z-10" />
              
              {/* Quote content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 text-white">
                <blockquote className="text-xl font-bold mb-2 drop-shadow-2xl">
                  {item.quote}
                </blockquote>
                <div className="flex items-center gap-1 text-sm font-medium drop-shadow-lg">
                  <span className="text-red-500">❤️</span>
                  <span>Goodable</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Navigation arrow button */}
        <Button
          onClick={handleNext}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20"
          disabled={isAnimating}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-12 flex gap-2 z-30">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => !isAnimating && setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-white w-8" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auth2;
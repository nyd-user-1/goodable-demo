import React, { useState, useEffect } from 'react';
import { LoginForm } from "@/components/login-form";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Auth2: React.FC = () => {
  // Carousel data with images and quotes (first two must be as specified)
  const carouselData = [
    {
      image: 'https://kwyjohornlgujoqypyvu.supabase.co/storage/v1/object/public/goodable-assets/IMG-012.avif',
      quote: "It has meaning if you give it meaning."
    },
    {
      image: 'https://kwyjohornlgujoqypyvu.supabase.co/storage/v1/object/public/goodable-assets/IMG-015.avif', 
      quote: "Both, it's always both."
    },
    {
      image: 'https://kwyjohornlgujoqypyvu.supabase.co/storage/v1/object/public/goodable-assets/IMG-017.avif',
      quote: "Retweets are easy. Real change is not."
    },
    {
      image: 'https://kwyjohornlgujoqypyvu.supabase.co/storage/v1/object/public/goodable-assets/IMG-019.avif',
      quote: "Not left. Not right. Just forward."
    },
    {
      image: 'https://kwyjohornlgujoqypyvu.supabase.co/storage/v1/object/public/goodable-assets/IMG-020.avif',
      quote: "Big voice? Big following? Big deal. Be big."
    },
    {
      image: 'https://kwyjohornlgujoqypyvu.supabase.co/storage/v1/object/public/goodable-assets/IMG-023.avif',
      quote: "It's not about sides—it's about systems."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
        setIsAnimating(false);
      }, 600); // Match animation duration
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
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>
      </div>
      
      {/* Right side - Image carousel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Image container with slide animation */}
        <div className="relative h-full bg-gray-100 dark:bg-gray-900">
          {carouselData.map((item, index) => {
            const isActive = index === currentIndex;
            const isNext = index === (currentIndex + 1) % carouselData.length;
            
            return (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-transform duration-[600ms] ease-in-out",
                  isActive && !isAnimating && "translate-x-0",
                  isActive && isAnimating && "translate-x-full",
                  isNext && !isAnimating && "-translate-x-full",
                  isNext && isAnimating && "translate-x-0",
                  !isActive && !isNext && "-translate-x-full"
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
              
              {/* Overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
              
              {/* Quote content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 text-white">
                <blockquote className="text-xl font-medium mb-2 drop-shadow-lg">
                  {item.quote}
                </blockquote>
                <div className="flex items-center gap-1 text-sm opacity-90">
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
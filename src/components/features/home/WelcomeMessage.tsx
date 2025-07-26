import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const messages = [
  "You're putting the public back in public policy.",
  "It has meaning if you give it meaning.",
  "No one is coming. It's up to you now.",
  "Wow! That idea you have is a good one. Tell us about it.",
  "Remember, we're all in this boat together.",
  "Are you looking for someone to follow. Or something to do? We've got'em both."
];

export const WelcomeMessage = () => {
  const { user, loading: authLoading } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Set dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Get message index from session storage or initialize
  useEffect(() => {
    const storedIndex = sessionStorage.getItem('welcomeMessageIndex');
    if (storedIndex) {
      setMessageIndex(parseInt(storedIndex));
    }
  }, []);

  // Rotate message on each page load
  useEffect(() => {
    const nextIndex = (messageIndex + 1) % messages.length;
    sessionStorage.setItem('welcomeMessageIndex', nextIndex.toString());
  }, []);

  // Handle loading state - show skeleton while auth is loading or briefly after user loads
  useEffect(() => {
    if (!authLoading && user) {
      // Add a small delay for smooth transition effect
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [authLoading, user]);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.display_name) return user.user_metadata.display_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  // Only show for authenticated users
  if (!user) return null;

  // Show skeleton loading state
  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-500">
        <Skeleton className="h-8 w-64 mb-2" />
        <div className="mt-4">
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-700 ease-out">
      <h3 className="text-2xl font-bold text-foreground mb-2">
        {greeting}, {getUserDisplayName()}!
      </h3>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{messages[messageIndex]}</span>
      </div>
    </div>
  );
};
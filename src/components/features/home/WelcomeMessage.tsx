import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export const WelcomeMessage = () => {
  const { user, loading: authLoading } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');
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
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="cursor-pointer underline decoration-dotted hover:text-foreground transition-colors">
              Getting Started
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Welcome to Goodable!</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Start by entering a problem you'd like to solve in the search box below</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Browse existing policy solutions and legislative ideas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Connect with other policy makers and collaborate on solutions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Use AI-powered analysis to refine your policy proposals</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  You're putting the public back in public policy.
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};
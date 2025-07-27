import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Sparkles,
  X
} from 'lucide-react';

interface GettingStartedTask {
  id: string;
  text: string;
  completed: boolean;
  hasLink?: boolean;
}

export const WelcomeMessage = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useCurrentUserProfile();
  const [greeting, setGreeting] = useState('Good morning');
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});
  const [gettingStartedClicked, setGettingStartedClicked] = useState(false);

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

  // Load user progress from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedProgress = localStorage.getItem(`user-progress-${user.id}`);
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
      
      // Load getting started clicked state
      const clickedState = localStorage.getItem(`getting-started-clicked-${user.id}`);
      if (clickedState === 'true') {
        setGettingStartedClicked(true);
      }
    }
  }, [user?.id]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (user?.id && Object.keys(userProgress).length > 0) {
      localStorage.setItem(`user-progress-${user.id}`, JSON.stringify(userProgress));
    }
  }, [userProgress, user?.id]);

  // Live detection of task completion
  useEffect(() => {
    const checkLiveProgress = async () => {
      if (!user?.id) return;

      try {
        // Check profile completion
        if (profile && (profile.display_name || profile.bio)) {
          setUserProgress(prev => ({ ...prev, profile: true }));
        }

        // Check for favorites (bills tracking)
        const { data: favorites } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (favorites && favorites.length > 0) {
          setUserProgress(prev => ({ ...prev, track_bill: true, watchlist: true }));
        }

        // Check for chat sessions (uploaded documents or member exploration)
        const { data: chats } = await supabase
          .from('chat_sessions')
          .select('id, member_id')
          .eq('user_id', user.id)
          .limit(5);

        if (chats && chats.length > 0) {
          setUserProgress(prev => ({ ...prev, upload: true }));
          
          // Check if any chats are member-focused
          if (chats.some(chat => chat.member_id)) {
            setUserProgress(prev => ({ ...prev, member_profile: true }));
          }
        }

        // Auto-mark section visits based on current location
        const currentPath = window.location.pathname;
        if (currentPath === '/bills') {
          setUserProgress(prev => ({ ...prev, visit_bills: true }));
        }
        if (currentPath === '/members') {
          setUserProgress(prev => ({ ...prev, visit_members: true }));
        }
        if (currentPath === '/feed') {
          setUserProgress(prev => ({ ...prev, visit_intel: true }));
        }
        if (currentPath === '/challenges') {
          setUserProgress(prev => ({ ...prev, explore_challenges: true }));
        }
        if (currentPath === '/solutions') {
          setUserProgress(prev => ({ ...prev, explore_solutions: true }));
        }
        if (currentPath === '/chats' || currentPath === '/playground') {
          setUserProgress(prev => ({ ...prev, try_chat: true }));
        }

      } catch (error) {
        // Error checking progress - continue silently
      }
    };

    // Run check immediately and then every 30 seconds for live updates
    checkLiveProgress();
    const interval = setInterval(checkLiveProgress, 30000);

    return () => clearInterval(interval);
  }, [user?.id, profile]);


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

  const gettingStartedTasks: GettingStartedTask[] = [
    { id: '1', text: 'Complete your profile information', completed: userProgress['profile'] || false, hasLink: true },
    { id: '2', text: 'Visit the Intel Section', completed: userProgress['visit_intel'] || false, hasLink: true },
    { id: '3', text: 'Visit the Bills section', completed: userProgress['visit_bills'] || false, hasLink: true },
    { id: '4', text: 'Visit the Members section', completed: userProgress['visit_members'] || false, hasLink: true },
    { id: '5', text: 'Explore Challenges', completed: userProgress['explore_challenges'] || false, hasLink: true },
    { id: '6', text: 'Explore Solutions', completed: userProgress['explore_solutions'] || false, hasLink: true },
    { id: '7', text: 'Select a Model', completed: userProgress['select_model'] || false, hasLink: true },
    { id: '8', text: 'Try Chat', completed: userProgress['try_chat'] || false, hasLink: true }
  ];

  const completedTasks = gettingStartedTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / gettingStartedTasks.length) * 100;

  const markTaskCompleted = (taskId: string) => {
    if (user?.id) {
      setUserProgress(prev => ({ ...prev, [taskId]: true }));
    }
  };

  const handleTaskClick = (task: GettingStartedTask) => {
    if (task.hasLink && !task.completed) {
      // Navigate based on task type
      switch (task.id) {
        case '1':
          window.location.href = '/profile';
          break;
        case '2':
          window.location.href = '/feed';
          setTimeout(() => markTaskCompleted('visit_intel'), 1000);
          break;
        case '3':
          window.location.href = '/bills';
          setTimeout(() => markTaskCompleted('visit_bills'), 1000);
          break;
        case '4':
          window.location.href = '/members';
          setTimeout(() => markTaskCompleted('visit_members'), 1000);
          break;
        case '5':
          window.location.href = '/challenges';
          setTimeout(() => markTaskCompleted('explore_challenges'), 1000);
          break;
        case '6':
          window.location.href = '/solutions';
          setTimeout(() => markTaskCompleted('explore_solutions'), 1000);
          break;
        case '7':
          // Mark model selection as completed when they interact with model selector
          setUserProgress(prev => ({ ...prev, select_model: true }));
          break;
        case '8':
          window.location.href = '/playground';
          setTimeout(() => markTaskCompleted('try_chat'), 1000);
          break;
      }
    }
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
        <HoverCard onOpenChange={(open) => {
          if (open && !gettingStartedClicked) {
            setGettingStartedClicked(true);
            if (user?.id) {
              localStorage.setItem(`getting-started-clicked-${user.id}`, 'true');
            }
          }
        }}>
          <HoverCardTrigger asChild>
            <span 
              className={`cursor-pointer underline decoration-dotted transition-colors ${
                gettingStartedClicked 
                  ? 'text-[#8B8D98]' // Accent gray after clicked
                  : 'text-[#5A7FDB] hover:text-[#3D63DD]' // Secondary blue default, primary blue on hover
              }`}
            >
              Getting Started
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 max-w-[90vw] p-0" side="bottom" align="start">
            <div className={`p-4 ${progressPercentage === 100 ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold">Getting Started</h4>
                  {progressPercentage === 100 && (
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <Badge 
                  variant={progressPercentage === 100 ? "default" : "secondary"} 
                  className={`text-xs ${progressPercentage === 100 ? 'bg-emerald-600 text-white' : ''}`}
                >
                  {completedTasks} of {gettingStartedTasks.length}
                </Badge>
              </div>
              
              {progressPercentage === 100 ? (
                <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                      Congratulations! You've completed the onboarding.
                    </span>
                  </div>
                </div>
              ) : (
                <Progress value={progressPercentage} className="mb-4" />
              )}

              <div className="space-y-3 max-h-80 overflow-y-auto overflow-x-hidden">
                {gettingStartedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                      task.hasLink && !task.completed 
                        ? 'hover:bg-muted/50 cursor-pointer hover:scale-[1.02]' 
                        : task.completed 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/10' 
                        : ''
                    }`}
                    onClick={() => handleTaskClick(task)}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0 animate-in zoom-in duration-300" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0 hover:text-primary transition-colors" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm transition-all duration-200 break-words ${
                        task.completed 
                          ? 'text-emerald-700 dark:text-emerald-300 line-through' 
                          : 'text-foreground'
                      }`}>
                        {task.text}
                      </p>
                      {task.hasLink && !task.completed && (
                        <div className="flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                          <ExternalLink className="w-3 h-3 text-primary" />
                          <span className="text-xs text-primary font-medium">Start task</span>
                        </div>
                      )}
                      {task.completed && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">Completed!</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};
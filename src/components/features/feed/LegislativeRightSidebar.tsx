import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Clock,
  FileText,
  BookOpen,
  Sparkles,
  X
} from 'lucide-react';

interface GettingStartedTask {
  id: string;
  text: string;
  completed: boolean;
  hasLink?: boolean;
}

interface Project {
  id: string;
  name: string;
  status: string;
  lastActivity: string;
  questionCount: number;
  lastQuestion?: string;
}

export const LegislativeRightSidebar: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useCurrentUserProfile();
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});
  const [isBoxMinimized, setIsBoxMinimized] = useState(false);

  // Load user progress from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedProgress = localStorage.getItem(`user-progress-${user.id}`);
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
      
      // Load minimized state
      const boxState = localStorage.getItem(`getting-started-minimized-${user.id}`);
      if (boxState) {
        setIsBoxMinimized(JSON.parse(boxState));
      }
    }
  }, [user?.id]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (user?.id && Object.keys(userProgress).length > 0) {
      localStorage.setItem(`user-progress-${user.id}`, JSON.stringify(userProgress));
    }
  }, [userProgress, user?.id]);

  // Save minimized state
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`getting-started-minimized-${user.id}`, JSON.stringify(isBoxMinimized));
    }
  }, [isBoxMinimized, user?.id]);

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

        // Auto-mark bills section visit based on current location
        if (window.location.pathname === '/bills') {
          setUserProgress(prev => ({ ...prev, visit_bills: true }));
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

  const gettingStartedTasks: GettingStartedTask[] = [
    { id: '1', text: 'Complete your profile information', completed: userProgress['profile'] || false, hasLink: true },
    { id: '2', text: 'Upload and analyze a legislative document', completed: userProgress['upload'] || false, hasLink: true },
    { id: '3', text: 'Track your first bill', completed: userProgress['track_bill'] || false, hasLink: true },
    { id: '4', text: 'Visit the Bills section', completed: userProgress['visit_bills'] || false, hasLink: true },
    { id: '5', text: 'Explore a member profile', completed: userProgress['member_profile'] || false, hasLink: true },
    { id: '6', text: 'Create your first watchlist', completed: userProgress['watchlist'] || false, hasLink: true }
  ];

  const projects: Project[] = [
    {
      id: '1',
      name: 'Healthcare Reform Tracking',
      status: 'Active research',
      lastActivity: '2 hours ago',
      questionCount: 5,
      lastQuestion: 'What are the implementation costs for universal healthcare?'
    },
    {
      id: '2',
      name: 'Education Policy Analysis',
      status: 'No recent questions',
      lastActivity: '3 hours ago',
      questionCount: 1
    },
    {
      id: '3',
      name: 'Climate Legislation Watch',
      status: 'Active tracking',
      lastActivity: '1 day ago',
      questionCount: 8,
      lastQuestion: 'How do carbon pricing mechanisms work in practice?'
    }
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
          // Open document upload modal or navigate to upload area
          window.dispatchEvent(new CustomEvent('open-document-upload'));
          break;
        case '3':
        case '4':
          window.location.href = '/bills';
          setTimeout(() => markTaskCompleted('visit_bills'), 1000);
          break;
        case '5':
          window.location.href = '/members';
          setTimeout(() => markTaskCompleted('member_profile'), 2000);
          break;
        case '6':
          window.location.href = '/favorites';
          break;
      }
    }
  };

  const handleProjectClick = (project: Project) => {
    // Navigate to chats with project filter
    window.location.href = `/chats?project=${encodeURIComponent(project.name)}`;
  };

  const toggleBoxMinimized = () => {
    setIsBoxMinimized(!isBoxMinimized);
  };


  return (
    <div className="space-y-6">
      {/* Getting Started */}
      <Card className={progressPercentage === 100 ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800' : ''}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">Getting Started</CardTitle>
              {progressPercentage === 100 && (
                <Sparkles className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={progressPercentage === 100 ? "default" : "secondary"} 
                className={`text-xs ${progressPercentage === 100 ? 'bg-emerald-600 text-white' : ''}`}
              >
                {completedTasks} of {gettingStartedTasks.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={toggleBoxMinimized}
              >
                {isBoxMinimized ? '↗' : <X className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          {progressPercentage === 100 ? (
            <div className="mt-3 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Congratulations! You've completed the onboarding.
                </span>
              </div>
            </div>
          ) : (
            <Progress value={progressPercentage} className="mt-3" />
          )}
        </CardHeader>
        {!isBoxMinimized && (
          <CardContent className="space-y-3">
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
                  <p className={`text-sm transition-all duration-200 ${
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
          </CardContent>
        )}
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Research Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project, index) => (
            <div key={project.id}>
              <div
                className="p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm">
                    {project.name}
                  </h4>
                  <Badge 
                    variant={project.status.includes('Active') ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {project.status.includes('Active') ? 'Active' : 'Idle'}
                  </Badge>
                </div>
                
                {project.lastQuestion && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    "{project.lastQuestion}"
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{project.questionCount} questions</span>
                  <Separator orientation="vertical" className="h-3" />
                  <Clock className="w-3 h-3" />
                  <span>{project.lastActivity}</span>
                </div>
              </div>
              
              {index < projects.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
          
          <Button variant="outline" className="w-full mt-4">
            <BookOpen className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">247</div>
              <div className="text-xs text-muted-foreground">Bills Tracked</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">18</div>
              <div className="text-xs text-muted-foreground">Active Projects</div>
            </div>
          </div>
          
          <div className="text-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="text-lg font-semibold text-primary">85%</div>
            <div className="text-xs text-muted-foreground">Research Completion Rate</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Clock,
  FileText,
  BookOpen
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
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});

  // Load user progress from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedProgress = localStorage.getItem(`user-progress-${user.id}`);
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
    }
  }, [user?.id]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (user?.id && Object.keys(userProgress).length > 0) {
      localStorage.setItem(`user-progress-${user.id}`, JSON.stringify(userProgress));
    }
  }, [userProgress, user?.id]);

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
      console.log('Navigating to complete task:', task.id);
      // Navigate based on task type
      switch (task.id) {
        case '1':
          window.location.href = '/profile';
          break;
        case '2':
          // Open document upload modal
          window.dispatchEvent(new CustomEvent('open-document-upload'));
          break;
        case '3':
        case '4':
          window.location.href = '/bills';
          setTimeout(() => markTaskCompleted('visit_bills'), 1000);
          break;
        case '5':
          window.location.href = '/members';
          break;
        case '6':
          window.location.href = '/favorites';
          break;
        default:
          console.log('Unknown task:', task.id);
      }
    }
  };

  const handleProjectClick = (project: Project) => {
    console.log('Opening project:', project.name);
    // Navigate to chats with project filter
    window.location.href = `/chats?project=${encodeURIComponent(project.name)}`;
  };


  return (
    <div className="space-y-6">
      {/* Getting Started */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Getting Started</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {completedTasks} of {gettingStartedTasks.length}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="mt-3" />
        </CardHeader>
        <CardContent className="space-y-3">
          {gettingStartedTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                task.hasLink && !task.completed 
                  ? 'hover:bg-muted/50 cursor-pointer' 
                  : ''
              }`}
              onClick={() => handleTaskClick(task)}
            >
              {task.completed ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${
                  task.completed 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground'
                }`}>
                  {task.text}
                </p>
                {task.hasLink && !task.completed && (
                  <div className="flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary">Start task</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
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
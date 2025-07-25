import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  MessageSquare, 
  Clock,
  FileText,
  Users,
  TrendingUp,
  BookOpen
} from 'lucide-react';

interface GettingStartedTask {
  id: string;
  text: string;
  completed: boolean;
  hasLink?: boolean;
}

interface ConversationSuggestion {
  id: string;
  question: string;
  billNumber?: string;
  category: 'bill' | 'policy' | 'member';
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
  const gettingStartedTasks: GettingStartedTask[] = [
    { id: '1', text: 'You asked your first policy question!', completed: true },
    { id: '2', text: 'Upload and analyze a legislative document', completed: false, hasLink: true },
    { id: '3', text: 'You tracked your first bill', completed: true },
    { id: '4', text: 'Read A.1234 Healthcare Reform report', completed: false, hasLink: true },
    { id: '5', text: 'You analyzed a legislator voting record', completed: true },
    { id: '6', text: 'Create your first policy watchlist', completed: false, hasLink: true }
  ];

  const conversationSuggestions: ConversationSuggestion[] = [
    {
      id: '1',
      question: "What is the current status of New York's healthcare reform legislation?",
      billNumber: 'A.1234',
      category: 'bill'
    },
    {
      id: '2',
      question: "When is the next Senate Education Committee hearing scheduled?",
      category: 'policy'
    },
    {
      id: '3',
      question: "What are the key provisions in the proposed infrastructure spending bill?",
      billNumber: 'S.5678',
      category: 'bill'
    },
    {
      id: '4',
      question: "How did my representatives vote on recent climate legislation?",
      category: 'member'
    }
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

  const handleTaskClick = (task: GettingStartedTask) => {
    if (task.hasLink && !task.completed) {
      console.log('Navigating to complete task:', task.id);
      // Navigate based on task type
      switch (task.id) {
        case '2':
          // Open document upload modal
          window.dispatchEvent(new CustomEvent('open-document-upload'));
          break;
        case '4':
          // Navigate to specific bill
          window.location.href = '/bills?selected=A.1234';
          break;
        case '6':
          // Navigate to favorites/watchlists
          window.location.href = '/favorites';
          break;
        default:
          console.log('Unknown task:', task.id);
      }
    }
  };

  const handleSuggestionClick = (suggestion: ConversationSuggestion) => {
    console.log('Starting conversation with:', suggestion.question);
    
    // If we're on the feed page, populate the search
    if (window.location.pathname === '/feed') {
      window.dispatchEvent(new CustomEvent('populate-search', { 
        detail: { query: suggestion.question } 
      }));
    } else {
      // Navigate to feed with the suggestion
      window.location.href = `/feed?q=${encodeURIComponent(suggestion.question)}`;
    }
  };

  const handleProjectClick = (project: Project) => {
    console.log('Opening project:', project.name);
    // Navigate to chats with project filter
    window.location.href = `/chats?project=${encodeURIComponent(project.name)}`;
  };

  const getCategoryIcon = (category: ConversationSuggestion['category']) => {
    switch (category) {
      case 'bill':
        return <FileText className="w-3 h-3" />;
      case 'member':
        return <Users className="w-3 h-3" />;
      default:
        return <TrendingUp className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Getting Started */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Getting Started</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {completedTasks} Completed
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

      {/* Continue Conversation */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Continue Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversationSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-primary/10 text-primary">
                  {getCategoryIcon(suggestion.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    {suggestion.question}
                  </p>
                  <div className="flex items-center gap-2">
                    {suggestion.billNumber && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.billNumber}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs capitalize">
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full mt-4">
            <MessageSquare className="w-4 h-4 mr-2" />
            Start New Research
          </Button>
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
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock,
  BookOpen
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  lastActivity: string;
  questionCount: number;
  lastQuestion?: string;
}

export const LegislativeRightSidebar: React.FC = () => {

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

  const handleProjectClick = (project: Project) => {
    // Navigate to chats with project filter
    window.location.href = `/chats?project=${encodeURIComponent(project.name)}`;
  };


  return (
    <div className="space-y-6">

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
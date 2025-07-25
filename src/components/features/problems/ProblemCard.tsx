import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Problem } from "@/data/problems";
import { Users, FileText, ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { useState } from "react";

interface ProblemCardProps {
  problem: Problem;
  onClick: () => void;
}

export const ProblemCard = ({ problem, onClick }: ProblemCardProps) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [votes] = useState({
    up: Math.floor(Math.random() * 100) + 20,
    down: Math.floor(Math.random() * 20) + 5
  });
  const [commentCount] = useState(Math.floor(Math.random() * 30) + 5);

  const priorityColors = {
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    normal: 'bg-primary/10 text-primary border-primary/20',
    low: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
  };

  const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation();
    setUserVote(userVote === voteType ? null : voteType);
  };

  const getVoteColor = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      return voteType === 'up' ? 'text-green-600' : 'text-red-600';
    }
    return 'text-muted-foreground';
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with title and priority */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-2">
                {problem.title}
              </h3>
              <Badge className={priorityColors[problem.priority]}>
                {problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)} Priority
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {problem.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{problem.subProblems} collaborators</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{problem.solutions} proposals</span>
              </div>
            </div>
          </div>

          {/* Voting and Comments */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleVote(e, 'up')}
                className={getVoteColor('up')}
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                {votes.up}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleVote(e, 'down')}
                className={getVoteColor('down')}
              >
                <ArrowDown className="w-4 h-4 mr-1" />
                {votes.down}
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                {commentCount}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
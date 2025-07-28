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

  const priorityConfig = {
    urgent: { text: 'Destructive', variant: 'destructive' as const },
    high: { text: 'Warning', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' },
    normal: { text: 'Normal', variant: 'secondary' as const },
    low: { text: 'Default', variant: 'default' as const }
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
      className="cursor-pointer hover:bg-muted/50 transition-colors hover:shadow-md h-full"
      onClick={onClick}
    >
      <CardContent className="p-6 h-full flex flex-col">
        {/* Header with title */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg leading-tight">
            {problem.title}
          </h3>
        </div>

        {/* Description - flex-grow to push other content down */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-grow mb-6">
          {problem.description}
        </p>

        {/* Priority badge - moved below content */}
        <div className="mb-6">
          {priorityConfig[problem.priority].variant ? (
            <Badge variant={priorityConfig[problem.priority].variant}>
              {priorityConfig[problem.priority].text}
            </Badge>
          ) : (
            <Badge className={priorityConfig[problem.priority].className}>
              {priorityConfig[problem.priority].text}
            </Badge>
          )}
        </div>

        {/* Voting and Comments - always at bottom */}
        <div className="flex items-center justify-between pt-6 border-t">
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
      </CardContent>
    </Card>
  );
};
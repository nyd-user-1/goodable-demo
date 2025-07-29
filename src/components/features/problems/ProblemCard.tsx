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
    high: { text: 'Warning', variant: 'warning' as const },
    normal: { text: 'Normal', variant: 'secondary' as const },
    low: { text: 'Default', variant: 'default' as const }
  };

  const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation();
    setUserVote(userVote === voteType ? null : voteType);
  };

  const getVoteStyles = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      // Clicked state - stays colored even on hover
      return voteType === 'up' 
        ? 'text-green-600 hover:text-green-600 hover:bg-green-50' 
        : 'text-red-600 hover:text-red-600 hover:bg-red-50';
    }
    // Default state - muted color that shows muted colored hover
    return voteType === 'up'
      ? 'text-muted-foreground hover:text-green-600 hover:bg-green-50/50'
      : 'text-muted-foreground hover:text-red-600 hover:bg-red-50/50';
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
          <Badge variant={priorityConfig[problem.priority].variant}>
            {priorityConfig[problem.priority].text}
          </Badge>
        </div>

        {/* Voting and Comments - always at bottom */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => handleVote(e, 'up')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${getVoteStyles('up')}`}
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">{votes.up}</span>
            </button>
            <button
              onClick={(e) => handleVote(e, 'down')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${getVoteStyles('down')}`}
            >
              <ArrowDown className="w-4 h-4" />
              <span className="text-sm font-medium">{votes.down}</span>
            </button>
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
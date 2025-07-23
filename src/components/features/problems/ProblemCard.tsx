import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Problem } from "@/data/problems";
import { Target, TrendingUp } from "lucide-react";
import { StarRating } from "@/components/StarRating";

interface ProblemCardProps {
  problem: Problem;
  onClick: () => void;
}

export const ProblemCard = ({ problem, onClick }: ProblemCardProps) => {
  const priorityColors = {
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    normal: 'bg-primary/10 text-primary border-primary/20',
    low: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
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
                <Target className="w-3 h-3" />
                <span>{problem.subProblems} sub-problems</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{problem.solutions} solutions</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-end">
            <StarRating 
              problemId={problem.id} 
              showVoteCount={false}
              showStars={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Problem } from "@/data/problems";

interface ProblemSummaryProps {
  problem: Problem;
  onFavorite?: (e: React.MouseEvent) => void;
  onAIAnalysis?: (e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
}

export const ProblemSummary = ({
  problem,
  onFavorite,
  onAIAnalysis,
  isFavorited = false,
  hasAIChat = false
}: ProblemSummaryProps) => {
  const priorityColors = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <Card className="card bg-card rounded-xl shadow-sm border overflow-hidden">
      <CardHeader className="card-header px-6 py-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold mb-2">
              {problem.title}
            </CardTitle>
            <Badge className={priorityColors[problem.priority]}>
              {problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)} Priority
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <CardActionButtons
              onFavorite={onFavorite}
              onAIAnalysis={onAIAnalysis}
              isFavorited={isFavorited}
              hasAIChat={hasAIChat}
              showFavorite={!!onFavorite}
              showAIAnalysis={!!onAIAnalysis}
              size="sm"
              variant="outline"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="card-body p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Category</h4>
            <p className="text-sm font-medium">
              {problem.category}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Proposals</h4>
            <p className="text-sm">{problem.subProblems}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Collaborators</h4>
            <p className="text-sm">{problem.solutions}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Priority</h4>
            <p className="text-sm">{problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)}</p>
          </div>
        </div>
        
        {problem.description && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {problem.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
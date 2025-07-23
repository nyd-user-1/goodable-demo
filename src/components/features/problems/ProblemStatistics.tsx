import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Problem } from "@/data/problems";
import { BarChart3 } from "lucide-react";

interface ProblemStatisticsProps {
  problem: Problem;
}

export const ProblemStatistics = ({ problem }: ProblemStatisticsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Problem Statistics</h2>
        <Badge variant="secondary" className="text-xs">
          {problem.statistics.length} {problem.statistics.length === 1 ? 'Statistic' : 'Statistics'}
        </Badge>
      </div>
      
      <div className="grid gap-6">
        {problem.statistics.map((stat, index) => (
          <Card key={index} className="section-container bg-card rounded-xl shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{stat.label}</h3>
                  </div>
                  {stat.source && (
                    <p className="text-sm text-muted-foreground">
                      Source: {stat.source}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {stat.value}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
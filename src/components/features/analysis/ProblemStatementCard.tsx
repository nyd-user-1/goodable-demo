import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProblemStatementCardProps {
  title: string;
  description: string;
  index: number;
  onAnalyze: (problem: string) => void;
}

export const ProblemStatementCard = ({ title, description, index, onAnalyze }: ProblemStatementCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onAnalyze(description)}>
      <CardHeader>
        <CardTitle className="text-lg">Problem Statement {String(index).padStart(4, '0')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </CardContent>
    </Card>
  );
};
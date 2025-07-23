import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface FiscalImpactCardProps {
  fiscalImpact: {
    estimatedCost: string;
    confidence: number;
    breakdown: string[];
  };
}

export const FiscalImpactCard = ({ fiscalImpact }: FiscalImpactCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fiscal Impact Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Cost Estimate</span>
            <Badge variant="outline">{fiscalImpact.confidence}% confidence</Badge>
          </div>
          <p className="text-2xl font-bold text-primary">{fiscalImpact.estimatedCost}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">Cost Breakdown:</h4>
          {fiscalImpact.breakdown.map((item, index) => (
            <p key={index} className="text-sm text-muted-foreground">• {item}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
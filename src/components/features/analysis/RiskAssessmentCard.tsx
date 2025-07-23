import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface RiskAssessmentCardProps {
  riskFactors: Array<{
    risk: string;
    probability: string;
    impact: string;
  }>;
}

export const RiskAssessmentCard = ({ riskFactors }: RiskAssessmentCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {riskFactors.map((risk, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{risk.risk}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Probability: {risk.probability}</span>
                  <span>Impact: {risk.impact}</span>
                </div>
              </div>
              <Badge variant="outline">
                {risk.probability === 'High' ? '🔴' : risk.probability === 'Medium' ? '🟡' : '🟢'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
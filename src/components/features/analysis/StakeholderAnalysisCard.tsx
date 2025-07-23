import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface StakeholderAnalysisCardProps {
  stakeholders: Array<{
    group: string;
    impact: string;
    position: string;
  }>;
}

export const StakeholderAnalysisCard = ({ stakeholders }: StakeholderAnalysisCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Stakeholder Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stakeholders.map((stakeholder, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{stakeholder.group}</p>
                <p className="text-sm text-muted-foreground">Impact: {stakeholder.impact}</p>
              </div>
              <Badge variant={
                stakeholder.position === 'Supportive' ? 'default' : 
                stakeholder.position === 'Opposed' ? 'destructive' : 'secondary'
              }>
                {stakeholder.position}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
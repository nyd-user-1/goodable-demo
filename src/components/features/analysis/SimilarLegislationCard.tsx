import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale } from "lucide-react";

interface SimilarLegislationCardProps {
  similarLegislation: Array<{
    state: string;
    bill: string;
    similarity: number;
    status: string;
  }>;
}

export const SimilarLegislationCard = ({ similarLegislation }: SimilarLegislationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Similar Legislation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {similarLegislation.map((leg, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{leg.state} - {leg.bill}</p>
                <p className="text-sm text-muted-foreground">{leg.similarity}% similarity</p>
              </div>
              <Badge variant={leg.status === 'Enacted' ? 'default' : leg.status === 'Pending' ? 'secondary' : 'destructive'}>
                {leg.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
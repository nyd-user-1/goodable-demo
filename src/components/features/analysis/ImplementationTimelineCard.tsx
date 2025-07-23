import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface ImplementationTimelineCardProps {
  implementationTimeline: {
    phases: Array<{
      name: string;
      duration: string;
      status: string;
    }>;
  };
}

export const ImplementationTimelineCard = ({ implementationTimeline }: ImplementationTimelineCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Implementation Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {implementationTimeline.phases.map((phase, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{phase.name}</span>
              <Badge variant="secondary">{phase.duration}</Badge>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
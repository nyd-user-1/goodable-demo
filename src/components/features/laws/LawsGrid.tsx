import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Law } from "@/data/laws";
import { BookOpen, Scale } from "lucide-react";

interface LawsGridProps {
  laws: Law[];
  onLawSelect: (law: Law) => void;
}

export const LawsGrid = ({ laws, onLawSelect }: LawsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {laws.map((law) => (
        <Card
          key={law.id}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-border/50 hover:border-primary/20"
          onClick={() => onLawSelect(law)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="font-mono text-xs">
                  {law.code}
                </Badge>
              </div>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg leading-tight">
              {law.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {law.fullName}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>New York State Law</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Consolidated
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
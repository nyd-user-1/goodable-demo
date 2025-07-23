import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Problem } from "@/data/problems";
import { Target, TrendingUp, Users, AlertTriangle } from "lucide-react";

interface ProblemKeyInformationProps {
  problem: Problem;
}

export const ProblemKeyInformation = ({ problem }: ProblemKeyInformationProps) => {
  const priorityColors = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityIcons = {
    urgent: AlertTriangle,
    high: AlertTriangle,
    normal: Target,
    low: Target
  };

  const PriorityIcon = priorityIcons[problem.priority];

  return (
    <Card className="section-container bg-card rounded-xl shadow-sm border p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5" />
          Problem Information
        </CardTitle>
        <CardDescription>
          Detailed overview of the problem scope and impact
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-0 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Category</span>
            </div>
            <p className="font-semibold">{problem.category}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Sub-problems</span>
            </div>
            <p className="font-semibold">{problem.subProblems}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Solutions</span>
            </div>
            <p className="font-semibold">{problem.solutions}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PriorityIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Priority Level</span>
            </div>
            <Badge className={priorityColors[problem.priority]}>
              {problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Problem Description */}
        <div className="space-y-3">
          <h4 className="font-medium text-base">Problem Overview</h4>
          <p className="text-muted-foreground leading-relaxed">
            {problem.description} This is a {problem.priority} priority issue that affects multiple aspects of policy and governance, requiring comprehensive analysis and strategic intervention.
          </p>
        </div>

        {/* Key Challenge Areas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Key Challenge Areas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Policy framework development</span>
            </div>
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Resource allocation strategies</span>
            </div>
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Stakeholder engagement</span>
            </div>
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Implementation oversight</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
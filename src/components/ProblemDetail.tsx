import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, TrendingUp, Users, ExternalLink } from "lucide-react";
import { Problem, getRelatedProblems } from "@/data/problems";
import { ProblemSummary } from "./features/problems/ProblemSummary";
import { ProblemKeyInformation } from "./features/problems/ProblemKeyInformation";
import { ProblemStatistics } from "./features/problems/ProblemStatistics";

interface ProblemDetailProps {
  problem: Problem;
  onBack: () => void;
}

export const ProblemDetail = ({ problem, onBack }: ProblemDetailProps) => {
  const [relatedProblems] = useState(() => getRelatedProblems(problem.id));

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement favorite functionality
    // TODO: Implement favorite functionality
  };

  const handleAIAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement AI analysis functionality
    // TODO: Implement AI analysis functionality
  };

  return (
    <div className="page-container min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Navigation Section */}
          <Button 
            variant="outline" 
            onClick={onBack}
            className="btn-secondary border border-gray-300 hover:border-gray-400 active:border-gray-500 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Button>

          {/* Problem Summary Section - Full Width */}
          <ProblemSummary 
            problem={problem}
            onFavorite={handleFavorite}
            onAIAnalysis={handleAIAnalysis}
            isFavorited={false}
            hasAIChat={false}
          />

          {/* Problem Tabs Section */}
          <section>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
                <TabsTrigger value="overview" className="h-10 rounded-md text-sm font-medium">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="solutions" className="h-10 rounded-md text-sm font-medium">
                  Solutions
                </TabsTrigger>
                <TabsTrigger value="statistics" className="h-10 rounded-md text-sm font-medium">
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="related" className="h-10 rounded-md text-sm font-medium">
                  Related
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Problem Key Information Section */}
                <ProblemKeyInformation problem={problem} />
              </TabsContent>

              <TabsContent value="solutions" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Proposed Solutions</h2>
                    <Badge variant="secondary" className="text-xs">
                      {problem.solutionsList.length} {problem.solutionsList.length === 1 ? 'Solution' : 'Solutions'}
                    </Badge>
                  </div>
                  <div className="grid gap-6">
                    {problem.solutionsList.map((solution) => (
                      <div key={solution.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-2">{solution.title}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {solution.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs ml-4">
                              {solution.id}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Feasibility</span>
                                <span className="text-sm text-muted-foreground">{solution.feasibility}/10</span>
                              </div>
                              <Progress value={solution.feasibility * 10} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Impact</span>
                                <span className="text-sm text-muted-foreground">{solution.impact}/10</span>
                              </div>
                              <Progress value={solution.impact * 10} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="statistics" className="mt-6">
                <ProblemStatistics problem={problem} />
              </TabsContent>

              <TabsContent value="related" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Related Problems</h2>
                    <Badge variant="secondary" className="text-xs">
                      {relatedProblems.length} {relatedProblems.length === 1 ? 'Problem' : 'Problems'}
                    </Badge>
                  </div>
                  <div>
                    {relatedProblems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">
                        No related problems found.
                      </p>
                    ) : (
                      <div className="grid gap-4">
                        {relatedProblems.map((relatedProblem) => (
                          <div
                            key={relatedProblem.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={() => window.location.href = `/problems/${relatedProblem.slug}`}
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{relatedProblem.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {relatedProblem.category} • {relatedProblem.subProblems} sub-problems • {relatedProblem.solutions} solutions
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground ml-4" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
};
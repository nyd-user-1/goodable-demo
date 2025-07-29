import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Problem } from "@/data/problems";
import { ProblemSummary } from "./features/problems/ProblemSummary";
import { ProblemOverview } from "./features/problems/ProblemOverview";
import { ProblemStatisticsEnhanced } from "./features/problems/ProblemStatisticsEnhanced";
import { ProblemSolutionsWhiteboard } from "./features/problems/ProblemSolutionsWhiteboard";
import { ProblemProposals } from "./features/problems/ProblemProposals";

interface ProblemDetailProps {
  problem: Problem;
  onBack: () => void;
}

export const ProblemDetail = ({ problem, onBack }: ProblemDetailProps) => {

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
            className=""
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
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
                <TabsTrigger value="proposals" className="h-10 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Proposals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <ProblemOverview problem={problem} />
              </TabsContent>

              <TabsContent value="solutions" className="mt-6">
                <ProblemSolutionsWhiteboard problem={problem} />
              </TabsContent>

              <TabsContent value="statistics" className="mt-6">
                <ProblemStatisticsEnhanced problem={problem} />
              </TabsContent>

              <TabsContent value="proposals" className="mt-6">
                <ProblemProposals problem={problem} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiscalImpactCard } from "./FiscalImpactCard";
import { ImplementationTimelineCard } from "./ImplementationTimelineCard";
import { SimilarLegislationCard } from "./SimilarLegislationCard";
import { StakeholderAnalysisCard } from "./StakeholderAnalysisCard";
import { RiskAssessmentCard } from "./RiskAssessmentCard";

interface AnalysisData {
  fiscalImpact: {
    estimatedCost: string;
    confidence: number;
    breakdown: string[];
  };
  implementationTimeline: {
    phases: Array<{
      name: string;
      duration: string;
      status: string;
    }>;
  };
  similarLegislation: Array<{
    state: string;
    bill: string;
    similarity: number;
    status: string;
  }>;
  stakeholders: Array<{
    group: string;
    impact: string;
    position: string;
  }>;
  riskFactors: Array<{
    risk: string;
    probability: string;
    impact: string;
  }>;
  fullAnalysis: string;
}

interface AnalysisResultsProps {
  analysisData: AnalysisData;
  onGenerateNew: () => void;
}

export const AnalysisResults = ({ analysisData, onGenerateNew }: AnalysisResultsProps) => {
  return (
    <div className="space-y-6">
      {analysisData?.fullAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysisData.fullAnalysis}</p>
            </div>
            <Button 
              onClick={onGenerateNew} 
              variant="outline" 
              className="mt-4"
            >
              Generate New Analysis
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FiscalImpactCard fiscalImpact={analysisData.fiscalImpact} />
        <ImplementationTimelineCard implementationTimeline={analysisData.implementationTimeline} />
      </div>

      <SimilarLegislationCard similarLegislation={analysisData.similarLegislation} />
      <StakeholderAnalysisCard stakeholders={analysisData.stakeholders} />
      <RiskAssessmentCard riskFactors={analysisData.riskFactors} />
    </div>
  );
};
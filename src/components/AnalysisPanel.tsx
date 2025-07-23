import { LegislativeDraft } from "@/types/legislation";
import { useState } from "react";
import { AnalysisGenerator } from "./analysis/AnalysisGenerator";
import { AnalysisResults } from "./analysis/AnalysisResults";

interface AnalysisPanelProps {
  draft: LegislativeDraft | null;
}

export const AnalysisPanel = ({ draft }: AnalysisPanelProps) => {
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalysisGenerated = (data: any) => {
    setAnalysisData(data);
  };

  const handleGenerateNew = () => {
    setAnalysisData(null);
  };

  // Default analysis data for when a draft is selected
  const defaultAnalysisData = {
    fiscalImpact: {
      estimatedCost: "$2.5M - $5.2M annually",
      confidence: 75,
      breakdown: [
        "Administrative costs: $1.2M",
        "Implementation costs: $800K",
        "Ongoing operations: $1.5M"
      ]
    },
    implementationTimeline: {
      phases: [
        { name: "Regulatory Development", duration: "6 months", status: "pending" },
        { name: "Agency Training", duration: "3 months", status: "pending" },
        { name: "Public Outreach", duration: "4 months", status: "pending" },
        { name: "Full Implementation", duration: "12 months", status: "pending" }
      ]
    },
    similarLegislation: [
      { state: "California", bill: "AB 123", similarity: 85, status: "Enacted" },
      { state: "New York", bill: "S 456", similarity: 72, status: "Pending" },
      { state: "Texas", bill: "HB 789", similarity: 68, status: "Failed" }
    ],
    stakeholders: [
      { group: "Industry Associations", impact: "High", position: "Opposed" },
      { group: "Consumer Groups", impact: "High", position: "Supportive" },
      { group: "Government Agencies", impact: "Medium", position: "Neutral" },
      { group: "Legal Community", impact: "Medium", position: "Mixed" }
    ],
    riskFactors: [
      { risk: "Constitutional Challenge", probability: "Medium", impact: "High" },
      { risk: "Implementation Delays", probability: "High", impact: "Medium" },
      { risk: "Industry Pushback", probability: "High", impact: "Medium" }
    ]
  };

  const currentAnalysis = analysisData || (draft ? defaultAnalysisData : null);

  if (!draft && !analysisData) {
    return <AnalysisGenerator onAnalysisGenerated={handleAnalysisGenerated} />;
  }

  if (currentAnalysis) {
    return <AnalysisResults analysisData={currentAnalysis} onGenerateNew={handleGenerateNew} />;
  }

  return null;
};
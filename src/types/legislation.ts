export interface LegislativeDraft {
  id: string;
  title: string;
  type: 'technology' | 'environment' | 'tax' | 'social services' | 'labor' | 'human rights' | 'digital rights' | 'education';
  originalIdea: string;
  improvedIdea: string;
  draftContent: string;
  analysis: {
    fiscalImpact: string;
    implementationTimeline: string;
    similarLegislation: string[];
    stakeholders: string[];
  };
  votes: {
    rating: number; // Average rating
    totalVotes: number; // Total number of votes
    starCounts: [number, number, number, number, number]; // Count for each star rating (1-5)
  };
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftProgress {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}
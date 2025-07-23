import { Badge } from "@/components/ui/badge";

interface BillJourneyProps {
  status: number | null;
  statusDesc?: string | null;
  lastAction?: string | null;
}

export const BillJourney = ({ status, statusDesc, lastAction }: BillJourneyProps) => {
  const steps = [
    { id: 1, label: "Introduced", shortLabel: "Introduced" },
    { id: 2, label: "In Committee", shortLabel: "Committee" },
    { id: 3, label: "On Floor Calendar", shortLabel: "Floor" },
    { id: 4, label: "Passed Chamber", shortLabel: "Passed" },
    { id: 5, label: "Failed/Defeated", shortLabel: "Failed" },
    { id: 6, label: "Signed/Enacted", shortLabel: "Signed" },
  ];

  const getCurrentStep = (status: number | null) => {
    if (!status) return 1;
    return Math.min(Math.max(status, 1), 6);
  };

  const currentStep = getCurrentStep(status);
  const isFailed = status === 5;

  const getStepStatus = (stepId: number) => {
    if (isFailed && stepId === 5) return "current";
    if (isFailed && stepId > 2) return "inactive";
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "inactive";
  };

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case "completed":
        return "bg-primary text-primary-foreground";
      case "current":
        return "bg-primary text-primary-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getConnectorColor = (fromStep: number) => {
    const fromStatus = getStepStatus(fromStep);
    const toStatus = getStepStatus(fromStep + 1);
    
    if (fromStatus === "completed" && (toStatus === "completed" || toStatus === "current")) {
      return "bg-primary";
    }
    return "bg-muted";
  };

  // Filter out "Failed" step unless the bill actually failed
  const visibleSteps = isFailed ? steps : steps.filter(step => step.id !== 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Current Bill Status</h4>
        {statusDesc && (
          <Badge variant="outline">{statusDesc}</Badge>
        )}
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between">
          {visibleSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.id);
            const isLast = index === visibleSteps.length - 1;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getStepColor(stepStatus)}`}
                  >
                    {step.id}
                  </div>
                  <div className="mt-2 text-xs text-center max-w-16">
                    <div className="font-medium">{step.shortLabel}</div>
                  </div>
                </div>
                
                {!isLast && (
                  <div className="flex-1 mx-2">
                    <div 
                      className={`h-0.5 ${getConnectorColor(step.id)}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {lastAction && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Latest Action</h4>
          <p className="text-sm break-words">{lastAction}</p>
        </div>
      )}
    </div>
  );
};
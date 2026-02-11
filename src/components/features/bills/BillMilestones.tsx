import { Card, CardContent } from "@/components/ui/card";
import { BillMilestone } from "@/hooks/useBillExtendedData";
import { cn } from "@/lib/utils";

// Ordered list of milestone stages for a bill's lifecycle
const MILESTONE_STAGES = [
  { key: "INTRODUCED", label: "Introduced" },
  { key: "IN_ASSEMBLY_COMM", label: "In Committee", sub: "Assembly" },
  { key: "IN_SENATE_COMM", label: "In Committee", sub: "Senate" },
  { key: "ASSEMBLY_FLOOR", label: "On Floor", sub: "Assembly" },
  { key: "SENATE_FLOOR", label: "On Floor", sub: "Senate" },
  { key: "PASSED_ASSEMBLY", label: "Passed", sub: "Assembly" },
  { key: "PASSED_SENATE", label: "Passed", sub: "Senate" },
  { key: "DELIVERED_TO_GOV", label: "Delivered to Governor" },
  { key: "SIGNED_BY_GOV", label: "Signed by Governor" },
];

// Map status types to our stage keys
function normalizeStatus(statusType: string): string {
  const map: Record<string, string> = {
    INTRODUCED: "INTRODUCED",
    IN_ASSEMBLY_COMM: "IN_ASSEMBLY_COMM",
    IN_SENATE_COMM: "IN_SENATE_COMM",
    ASSEMBLY_FLOOR: "ASSEMBLY_FLOOR",
    SENATE_FLOOR: "SENATE_FLOOR",
    PASSED_ASSEMBLY: "PASSED_ASSEMBLY",
    PASSED_SENATE: "PASSED_SENATE",
    DELIVERED_TO_GOV: "DELIVERED_TO_GOV",
    SIGNED_BY_GOV: "SIGNED_BY_GOV",
    VETOED: "DELIVERED_TO_GOV",
    ADOPTED: "SIGNED_BY_GOV",
  };
  return map[statusType] || statusType;
}

interface BillMilestonesProps {
  milestones: BillMilestone[];
  chamber: "assembly" | "senate" | null;
}

export const BillMilestones = ({ milestones, chamber }: BillMilestonesProps) => {
  if (!milestones || milestones.length === 0) return null;

  // Determine which stages are relevant based on the bill's chamber
  const isAssembly = chamber === "assembly";
  const relevantStages = MILESTONE_STAGES.filter((stage) => {
    // Always include Introduced, Delivered, Signed
    if (!stage.sub) return true;
    // For the originating chamber's stages, always include
    if (isAssembly && stage.sub === "Assembly") return true;
    if (!isAssembly && stage.sub === "Senate") return true;
    // For the other chamber, include if there's a milestone for it
    const normalizedKeys = milestones.map((m) => normalizeStatus(m.statusType));
    return normalizedKeys.includes(stage.key);
  });

  // Determine which stages have been reached
  const reachedKeys = new Set(
    milestones.map((m) => normalizeStatus(m.statusType))
  );

  // Always mark "INTRODUCED" as reached if we have any milestones
  reachedKeys.add("INTRODUCED");

  // Find the furthest reached stage index
  let furthestIndex = 0;
  relevantStages.forEach((stage, idx) => {
    if (reachedKeys.has(stage.key)) {
      furthestIndex = idx;
    }
  });

  return (
    <Card className="card bg-card rounded-xl shadow-sm border overflow-hidden">
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between overflow-x-auto">
          {relevantStages.map((stage, idx) => {
            const isReached = reachedKeys.has(stage.key);
            const isCurrent = idx === furthestIndex;

            return (
              <div key={stage.key} className="flex items-center flex-1 min-w-0 last:flex-none">
                {/* Node */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors",
                      isCurrent
                        ? "bg-primary border-primary ring-4 ring-primary/20"
                        : isReached
                        ? "bg-primary border-primary"
                        : "bg-background border-muted-foreground/30"
                    )}
                  />
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-xs font-medium whitespace-nowrap",
                        isReached ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {stage.label}
                    </p>
                    {stage.sub && (
                      <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {stage.sub}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {idx < relevantStages.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-1 mt-[-1.25rem]",
                      idx < furthestIndex
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

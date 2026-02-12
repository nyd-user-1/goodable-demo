import { Card, CardContent } from "@/components/ui/card";
import { BillMilestone } from "@/hooks/useBillExtendedData";
import { cn } from "@/lib/utils";

// Map status types to normalized stage keys
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

function buildReachedSet(milestones: BillMilestone[]): Set<string> {
  const reached = new Set(milestones.map((m) => normalizeStatus(m.statusType)));
  if (milestones.length > 0) reached.add("INTRODUCED");
  return reached;
}

type StageType = "shared" | "dual";
interface Stage {
  id: string;
  label: string;
  assemblyLabel?: string;
  senateLabel?: string;
  type: StageType;
  assemblyKey?: string;
  senateKey?: string;
  sharedKey?: string;
}

const STAGES: Stage[] = [
  { id: "introduced", label: "Introduced", type: "shared", sharedKey: "INTRODUCED" },
  {
    id: "committee", label: "In Committee", type: "dual",
    assemblyKey: "IN_ASSEMBLY_COMM", senateKey: "IN_SENATE_COMM",
    assemblyLabel: "In Committee\nAssembly", senateLabel: "In Committee\nSenate",
  },
  {
    id: "floor", label: "On Floor Calendar", type: "dual",
    assemblyKey: "ASSEMBLY_FLOOR", senateKey: "SENATE_FLOOR",
    assemblyLabel: "On Floor Calendar\nAssembly", senateLabel: "On Floor Calendar\nSenate",
  },
  {
    id: "passed", label: "Passed", type: "dual",
    assemblyKey: "PASSED_ASSEMBLY", senateKey: "PASSED_SENATE",
    assemblyLabel: "Passed Assembly", senateLabel: "Passed Senate",
  },
  { id: "delivered", label: "Delivered To\nGovernor", type: "shared", sharedKey: "DELIVERED_TO_GOV" },
  { id: "signed", label: "Signed By\nGovernor", type: "shared", sharedKey: "SIGNED_BY_GOV" },
];

// Desktop node sizes
const COMPLETED_SIZE = 18;
const CURRENT_SIZE = 22;
const UNREACHED_SIZE = 14;

// Box layout
const TRACK_ROW_H = 44;
const BOX_PY = 10;
const BOX_H = TRACK_ROW_H * 2 + BOX_PY * 2 + 12; // 120px

interface BillMilestonesProps {
  milestones: BillMilestone[];
  companionMilestones: BillMilestone[];
  chamber: "assembly" | "senate" | null;
}

function getFurthestStageIndex(assemblyReached: Set<string>, senateReached: Set<string>): number {
  let furthest = 0;
  STAGES.forEach((stage, idx) => {
    if (stage.type === "shared") {
      if (assemblyReached.has(stage.sharedKey!) || senateReached.has(stage.sharedKey!)) {
        furthest = idx;
      }
    } else {
      if (
        assemblyReached.has(stage.assemblyKey!) ||
        senateReached.has(stage.senateKey!)
      ) {
        furthest = idx;
      }
    }
  });
  return furthest;
}

function isStageReached(stage: Stage, assemblyReached: Set<string>, senateReached: Set<string>): boolean {
  if (stage.type === "shared") {
    return assemblyReached.has(stage.sharedKey!) || senateReached.has(stage.sharedKey!);
  }
  return assemblyReached.has(stage.assemblyKey!) || senateReached.has(stage.senateKey!);
}

// White checkmark SVG for completed nodes
function CheckIcon({ size = 10 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Three visual states: checkmark (past), large dot (current), empty circle (unreached)
function MilestoneNode({
  reached,
  isCurrent,
  compact = false,
}: {
  reached: boolean;
  isCurrent: boolean;
  compact?: boolean;
}) {
  const cSize = compact ? 16 : COMPLETED_SIZE;
  const curSize = compact ? 18 : CURRENT_SIZE;
  const uSize = compact ? 11 : UNREACHED_SIZE;
  const checkSize = compact ? 8 : 10;

  if (isCurrent) {
    // Current (furthest reached): larger filled blue circle
    return (
      <div
        className="rounded-full bg-primary flex-shrink-0"
        style={{ width: curSize, height: curSize }}
      />
    );
  }

  if (reached) {
    // Completed (past): blue circle with white checkmark
    return (
      <div
        className="rounded-full bg-primary flex items-center justify-center flex-shrink-0"
        style={{ width: cSize, height: cSize }}
      >
        <CheckIcon size={checkSize} />
      </div>
    );
  }

  // Unreached: empty circle with gray border
  return (
    <div
      className="rounded-full border-2 border-muted-foreground/30 bg-background flex-shrink-0"
      style={{ width: uSize, height: uSize }}
    />
  );
}

export const BillMilestones = ({
  milestones,
  companionMilestones,
  chamber,
}: BillMilestonesProps) => {
  if (!milestones || milestones.length === 0) return null;

  const originatingReached = buildReachedSet(milestones);
  const companionReached = buildReachedSet(companionMilestones);

  const assemblyReached = chamber === "assembly" ? originatingReached : companionReached;
  const senateReached = chamber === "senate" ? originatingReached : companionReached;

  const furthestIdx = getFurthestStageIndex(assemblyReached, senateReached);

  return (
    <Card className="card bg-card rounded-xl shadow-sm border">
      <CardContent className="px-4 sm:px-8 py-8">
        {/* Desktop layout */}
        <div className="hidden sm:block">
          <div className="flex items-center" style={{ minHeight: 220 }}>
            {STAGES.map((stage, idx) => {
              const stageReached = isStageReached(stage, assemblyReached, senateReached);
              const isFurthest = idx === furthestIdx;

              return (
                <div key={stage.id} className="flex items-center flex-1 min-w-0 last:flex-none">
                  {stage.type === "shared" ? (
                    /* Shared stage: single node with label below */
                    <div className="flex flex-col items-center" style={{ minWidth: 70 }}>
                      <MilestoneNode
                        reached={stageReached}
                        isCurrent={isFurthest && stageReached}
                      />
                      <p
                        className={cn(
                          "mt-3 text-xs font-medium text-center whitespace-pre-line leading-tight",
                          stageReached ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {stage.label}
                      </p>
                    </div>
                  ) : (
                    /* Dual stage: Assembly (top) + Senate (bottom) in a bordered box */
                    <div className="flex flex-col items-center" style={{ minWidth: 90 }}>
                      {/* Assembly label above box */}
                      <p
                        className={cn(
                          "text-[11px] font-medium text-center whitespace-pre-line leading-tight mb-2",
                          assemblyReached.has(stage.assemblyKey!)
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {stage.assemblyLabel}
                      </p>

                      {/* Box containing both nodes */}
                      <div
                        className="border border-muted-foreground/25 rounded-sm flex flex-col items-center px-6"
                        style={{ height: BOX_H }}
                      >
                        {/* Assembly node (top) */}
                        <div
                          className="flex items-center justify-center"
                          style={{ height: TRACK_ROW_H, marginTop: BOX_PY }}
                        >
                          <MilestoneNode
                            reached={assemblyReached.has(stage.assemblyKey!)}
                            isCurrent={isFurthest && assemblyReached.has(stage.assemblyKey!)}
                          />
                        </div>
                        <div className="flex-1" />
                        {/* Senate node (bottom) */}
                        <div
                          className="flex items-center justify-center"
                          style={{ height: TRACK_ROW_H, marginBottom: BOX_PY }}
                        >
                          <MilestoneNode
                            reached={senateReached.has(stage.senateKey!)}
                            isCurrent={isFurthest && senateReached.has(stage.senateKey!)}
                          />
                        </div>
                      </div>

                      {/* Senate label below box */}
                      <p
                        className={cn(
                          "text-[11px] font-medium text-center whitespace-pre-line leading-tight mt-2",
                          senateReached.has(stage.senateKey!)
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {stage.senateLabel}
                      </p>
                    </div>
                  )}

                  {/* Horizontal connector to next stage */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex-1 min-w-3 px-0.5 self-center">
                      {stage.type === "dual" && STAGES[idx + 1].type === "dual" ? (
                        /* Dual-to-dual: two parallel lines matching box track heights */
                        <div className="flex flex-col" style={{ height: BOX_H }}>
                          <div
                            className="flex items-center"
                            style={{ height: TRACK_ROW_H, marginTop: BOX_PY }}
                          >
                            <div
                              className={cn(
                                "flex-1 h-0.5",
                                assemblyReached.has(stage.assemblyKey!) &&
                                  assemblyReached.has(STAGES[idx + 1].assemblyKey!)
                                  ? "bg-primary"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          </div>
                          <div className="flex-1" />
                          <div
                            className="flex items-center"
                            style={{ height: TRACK_ROW_H, marginBottom: BOX_PY }}
                          >
                            <div
                              className={cn(
                                "flex-1 h-0.5",
                                senateReached.has(stage.senateKey!) &&
                                  senateReached.has(STAGES[idx + 1].senateKey!)
                                  ? "bg-primary"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          </div>
                        </div>
                      ) : (
                        /* Single centered line: shared↔dual or shared↔shared */
                        <div
                          className={cn(
                            "h-0.5",
                            stageReached &&
                              isStageReached(STAGES[idx + 1], assemblyReached, senateReached)
                              ? "bg-primary"
                              : stageReached
                              ? "bg-primary/40"
                              : "bg-muted-foreground/20"
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile layout - compact version */}
        <div className="sm:hidden">
          <div className="flex items-center overflow-x-auto pb-2" style={{ minHeight: 140 }}>
            {STAGES.map((stage, idx) => {
              const stageReached = isStageReached(stage, assemblyReached, senateReached);
              const isFurthest = idx === furthestIdx;

              const M_TRACK = 28;
              const M_PY = 6;
              const M_BOX = M_TRACK * 2 + M_PY * 2 + 6;

              return (
                <div key={stage.id} className="flex items-center flex-1 min-w-0 last:flex-none">
                  {stage.type === "shared" ? (
                    <div className="flex flex-col items-center" style={{ minWidth: 44 }}>
                      <MilestoneNode
                        reached={stageReached}
                        isCurrent={isFurthest && stageReached}
                        compact
                      />
                      <p
                        className={cn(
                          "mt-1.5 text-[9px] font-medium text-center whitespace-pre-line leading-tight",
                          stageReached ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {stage.label}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center" style={{ minWidth: 48 }}>
                      <div
                        className="border border-muted-foreground/25 rounded-sm flex flex-col items-center px-2"
                        style={{ height: M_BOX }}
                      >
                        <div
                          className="flex items-center justify-center"
                          style={{ height: M_TRACK, marginTop: M_PY }}
                        >
                          <MilestoneNode
                            reached={assemblyReached.has(stage.assemblyKey!)}
                            isCurrent={isFurthest && assemblyReached.has(stage.assemblyKey!)}
                            compact
                          />
                        </div>
                        <div className="flex-1" />
                        <div
                          className="flex items-center justify-center"
                          style={{ height: M_TRACK, marginBottom: M_PY }}
                        >
                          <MilestoneNode
                            reached={senateReached.has(stage.senateKey!)}
                            isCurrent={isFurthest && senateReached.has(stage.senateKey!)}
                            compact
                          />
                        </div>
                      </div>
                      <p
                        className={cn(
                          "mt-1.5 text-[9px] font-medium text-center whitespace-nowrap leading-tight",
                          stageReached ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {stage.id === "committee"
                          ? "Comm."
                          : stage.id === "floor"
                          ? "Floor"
                          : "Passed"}
                      </p>
                    </div>
                  )}

                  {/* Mobile connector */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex-1 min-w-1 px-0.5 self-center">
                      <div
                        className={cn(
                          "h-0.5",
                          stageReached &&
                            isStageReached(STAGES[idx + 1], assemblyReached, senateReached)
                            ? "bg-primary"
                            : "bg-muted-foreground/20"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

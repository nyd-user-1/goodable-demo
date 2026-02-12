import { Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BillMilestone } from "@/hooks/useBillExtendedData";
import { cn } from "@/lib/utils";

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

// Node sizes
const COMPLETED_SIZE = 18;
const CURRENT_SIZE = 22;
const UNREACHED_SIZE = 14;

// Box dimensions — taller for breathing room
const TRACK_ROW_H = 50;
const BOX_PY = 14;
const BOX_H = TRACK_ROW_H * 2 + BOX_PY * 2 + 16; // 144px

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
      if (assemblyReached.has(stage.assemblyKey!) || senateReached.has(stage.senateKey!)) {
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
    return (
      <div
        className="rounded-full bg-primary flex-shrink-0"
        style={{ width: curSize, height: curSize }}
      />
    );
  }

  if (reached) {
    return (
      <div
        className="rounded-full bg-primary flex items-center justify-center flex-shrink-0"
        style={{ width: cSize, height: cSize }}
      >
        <CheckIcon size={checkSize} />
      </div>
    );
  }

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
      <CardContent className="px-6 sm:px-10 py-10">
        {/* Desktop layout — stages are flex-none, connectors are flex-1 for even spacing */}
        <div className="hidden sm:block">
          <div className="flex items-center">
            {STAGES.map((stage, idx) => {
              const stageReached = isStageReached(stage, assemblyReached, senateReached);
              const isFurthest = idx === furthestIdx;
              const nextStage = idx < STAGES.length - 1 ? STAGES[idx + 1] : null;

              return (
                <Fragment key={stage.id}>
                  {/* Stage column — fixed width */}
                  {stage.type === "shared" ? (
                    <div className="flex-none flex flex-col items-center" style={{ minWidth: 64 }}>
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
                    <div className="flex-none flex flex-col items-center">
                      {/* Assembly label above */}
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

                      {/* Box with two nodes */}
                      <div
                        className="border border-muted-foreground/25 rounded-sm flex flex-col items-center"
                        style={{ height: BOX_H, minWidth: 56, paddingLeft: 20, paddingRight: 20 }}
                      >
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

                      {/* Senate label below */}
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

                  {/* Connector — takes equal remaining space */}
                  {nextStage && (
                    <div className="flex-1 min-w-4 self-center">
                      {stage.type === "dual" && nextStage.type === "dual" ? (
                        /* Dual→dual: two parallel lines aligned with box tracks */
                        <div className="flex flex-col" style={{ height: BOX_H }}>
                          <div
                            className="flex items-center"
                            style={{ height: TRACK_ROW_H, marginTop: BOX_PY }}
                          >
                            <div
                              className={cn(
                                "flex-1 h-0.5",
                                assemblyReached.has(stage.assemblyKey!) &&
                                  assemblyReached.has(nextStage.assemblyKey!)
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
                                  senateReached.has(nextStage.senateKey!)
                                  ? "bg-primary"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          </div>
                        </div>
                      ) : (
                        /* Single centered line */
                        <div
                          className={cn(
                            "h-0.5",
                            stageReached && isStageReached(nextStage, assemblyReached, senateReached)
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          )}
                        />
                      )}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="sm:hidden">
          <div className="flex items-center overflow-x-auto pb-2" style={{ minHeight: 120 }}>
            {STAGES.map((stage, idx) => {
              const stageReached = isStageReached(stage, assemblyReached, senateReached);
              const isFurthest = idx === furthestIdx;
              const nextStage = idx < STAGES.length - 1 ? STAGES[idx + 1] : null;

              const M_TRACK = 26;
              const M_PY = 5;
              const M_BOX = M_TRACK * 2 + M_PY * 2 + 6;

              return (
                <Fragment key={stage.id}>
                  {stage.type === "shared" ? (
                    <div className="flex-none flex flex-col items-center" style={{ minWidth: 40 }}>
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
                    <div className="flex-none flex flex-col items-center" style={{ minWidth: 40 }}>
                      <div
                        className="border border-muted-foreground/25 rounded-sm flex flex-col items-center px-1.5"
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

                  {nextStage && (
                    <div className="flex-1 min-w-1 self-center">
                      <div
                        className={cn(
                          "h-0.5",
                          stageReached && isStageReached(nextStage, assemblyReached, senateReached)
                            ? "bg-primary"
                            : "bg-muted-foreground/20"
                        )}
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

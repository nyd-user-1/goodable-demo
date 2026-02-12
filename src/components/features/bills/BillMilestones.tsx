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

// Build a set of reached keys from a milestones array
function buildReachedSet(milestones: BillMilestone[]): Set<string> {
  const reached = new Set(milestones.map((m) => normalizeStatus(m.statusType)));
  if (milestones.length > 0) reached.add("INTRODUCED");
  return reached;
}

// The 6 visual columns in the dual-track layout
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

// Seal image paths
const SEAL_ASSEMBLY = "/nys-assembly-seal.avif";
const SEAL_SENATE = "/nys-senate-seal.avif";
const SEAL_NYS = "/nys-seal.avif";

// Node sizes
const NODE_SIZE = 14;
const CURRENT_NODE_SIZE = 28;
const CURRENT_RING_SIZE = 38;

interface BillMilestonesProps {
  milestones: BillMilestone[];
  companionMilestones: BillMilestone[];
  chamber: "assembly" | "senate" | null;
}

// Find the furthest reached stage column index (0-5)
function getFurthestStageIndex(assemblyReached: Set<string>, senateReached: Set<string>): number {
  let furthest = 0;
  STAGES.forEach((stage, idx) => {
    if (stage.type === "shared") {
      if (assemblyReached.has(stage.sharedKey!) || senateReached.has(stage.sharedKey!)) {
        furthest = idx;
      }
    } else {
      if (assemblyReached.has(stage.assemblyKey!) || senateReached.has(stage.assemblyKey!) ||
          assemblyReached.has(stage.senateKey!) || senateReached.has(stage.senateKey!)) {
        furthest = idx;
      }
    }
  });
  return furthest;
}

// For a specific node in a dual-track, find if it's the furthest reached node overall
function isNodeCurrent(
  stageIdx: number,
  nodeKey: string,
  reached: Set<string>,
  assemblyReached: Set<string>,
  senateReached: Set<string>,
  furthestIdx: number,
): boolean {
  if (stageIdx !== furthestIdx) return false;
  if (!reached.has(nodeKey)) return false;
  return true;
}

// Check if any milestone key for a stage column is reached by either chamber
function isStageReached(stage: Stage, assemblyReached: Set<string>, senateReached: Set<string>): boolean {
  if (stage.type === "shared") {
    return assemblyReached.has(stage.sharedKey!) || senateReached.has(stage.sharedKey!);
  }
  return (
    assemblyReached.has(stage.assemblyKey!) ||
    assemblyReached.has(stage.senateKey!) ||
    senateReached.has(stage.assemblyKey!) ||
    senateReached.has(stage.senateKey!)
  );
}

// Node component: blue filled circle (reached), seal logo (current), or empty circle (unreached)
function MilestoneNode({
  reached,
  isCurrent,
  sealSrc,
  alt,
}: {
  reached: boolean;
  isCurrent: boolean;
  sealSrc: string;
  alt: string;
}) {
  if (isCurrent) {
    // Current stage: show seal with ring
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 ring-[3px] ring-primary/25"
        style={{ width: CURRENT_RING_SIZE, height: CURRENT_RING_SIZE }}
      >
        <img
          src={sealSrc}
          alt={alt}
          className="rounded-full object-contain"
          style={{ width: CURRENT_NODE_SIZE, height: CURRENT_NODE_SIZE }}
        />
      </div>
    );
  }

  if (reached) {
    // Past reached stage: filled blue circle
    return (
      <div
        className="rounded-full bg-primary flex-shrink-0"
        style={{ width: NODE_SIZE, height: NODE_SIZE }}
      />
    );
  }

  // Unreached: empty circle with gray border
  return (
    <div
      className="rounded-full border-2 border-muted-foreground/30 bg-background flex-shrink-0"
      style={{ width: NODE_SIZE, height: NODE_SIZE }}
    />
  );
}

// Shared (single-track) node: same logic but uses NYS seal for current
function SharedMilestoneNode({
  reached,
  isCurrent,
}: {
  reached: boolean;
  isCurrent: boolean;
}) {
  return (
    <MilestoneNode
      reached={reached}
      isCurrent={isCurrent}
      sealSrc={SEAL_NYS}
      alt="NYS Seal"
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

  // Row height for each track in the dual section
  const TRACK_ROW_H = 40;
  // Height of the box border area
  const BOX_H = TRACK_ROW_H * 2 + 16;

  return (
    <Card className="card bg-card rounded-xl shadow-sm border">
      <CardContent className="px-4 sm:px-8 py-8">
        {/* Desktop layout */}
        <div className="hidden sm:block">
          {/* Main flex row: all 6 stages + connectors */}
          <div className="flex items-center" style={{ minHeight: 200 }}>
            {STAGES.map((stage, idx) => {
              const stageReached = isStageReached(stage, assemblyReached, senateReached);
              const isFurthest = idx === furthestIdx;

              return (
                <div key={stage.id} className="flex items-center flex-1 min-w-0 last:flex-none">
                  {/* Stage column */}
                  {stage.type === "shared" ? (
                    /* Shared stage: single centered node with label below */
                    <div className="flex flex-col items-center" style={{ minWidth: 60 }}>
                      <SharedMilestoneNode
                        reached={stageReached}
                        isCurrent={isFurthest}
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
                    /* Dual stage: Assembly (top) + Senate (bottom) in a box */
                    <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
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

                      {/* The box with two nodes */}
                      <div
                        className="relative border border-muted-foreground/25 rounded-sm flex flex-col items-center justify-between px-4"
                        style={{ height: BOX_H, minWidth: 48 }}
                      >
                        {/* Assembly node */}
                        <div className="flex items-center justify-center" style={{ height: TRACK_ROW_H, marginTop: 8 }}>
                          <MilestoneNode
                            reached={assemblyReached.has(stage.assemblyKey!)}
                            isCurrent={isNodeCurrent(idx, stage.assemblyKey!, assemblyReached, assemblyReached, senateReached, furthestIdx)}
                            sealSrc={SEAL_ASSEMBLY}
                            alt="Assembly"
                          />
                        </div>

                        {/* Senate node */}
                        <div className="flex items-center justify-center" style={{ height: TRACK_ROW_H, marginBottom: 8 }}>
                          <MilestoneNode
                            reached={senateReached.has(stage.senateKey!)}
                            isCurrent={isNodeCurrent(idx, stage.senateKey!, senateReached, assemblyReached, senateReached, furthestIdx)}
                            sealSrc={SEAL_SENATE}
                            alt="Senate"
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

                  {/* Horizontal connector to next stage */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex-1 min-w-3 px-1 self-center">
                      {stage.type === "dual" && STAGES[idx + 1].type === "dual" ? (
                        /* Dual → dual: two separate horizontal lines (assembly top, senate bottom) */
                        <div className="flex flex-col" style={{ height: BOX_H }}>
                          <div className="flex items-center" style={{ height: TRACK_ROW_H + 8 }}>
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
                          <div className="flex items-center" style={{ height: TRACK_ROW_H + 8 }}>
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
                        /* Shared ↔ dual or shared ↔ shared: single centered line */
                        <div
                          className={cn(
                            "h-0.5",
                            stageReached && isStageReached(STAGES[idx + 1], assemblyReached, senateReached)
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

              return (
                <div key={stage.id} className="flex items-center flex-1 min-w-0 last:flex-none">
                  {stage.type === "shared" ? (
                    <div className="flex flex-col items-center" style={{ minWidth: 40 }}>
                      <SharedMilestoneNode
                        reached={stageReached}
                        isCurrent={isFurthest}
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
                    <div className="flex flex-col items-center" style={{ minWidth: 44 }}>
                      {/* Compact box with two nodes */}
                      <div className="border border-muted-foreground/25 rounded-sm flex flex-col items-center justify-between px-2 py-1.5 gap-1">
                        <MilestoneNode
                          reached={assemblyReached.has(stage.assemblyKey!)}
                          isCurrent={isNodeCurrent(idx, stage.assemblyKey!, assemblyReached, assemblyReached, senateReached, furthestIdx)}
                          sealSrc={SEAL_ASSEMBLY}
                          alt="Asm"
                        />
                        <MilestoneNode
                          reached={senateReached.has(stage.senateKey!)}
                          isCurrent={isNodeCurrent(idx, stage.senateKey!, senateReached, assemblyReached, senateReached, furthestIdx)}
                          sealSrc={SEAL_SENATE}
                          alt="Sen"
                        />
                      </div>
                      <p
                        className={cn(
                          "mt-1.5 text-[9px] font-medium text-center whitespace-nowrap leading-tight",
                          stageReached ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {stage.id === "committee" ? "Comm." : stage.id === "floor" ? "Floor" : "Passed"}
                      </p>
                    </div>
                  )}

                  {/* Mobile connector */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex-1 min-w-1 px-0.5 self-center">
                      <div
                        className={cn(
                          "h-0.5",
                          stageReached && isStageReached(STAGES[idx + 1], assemblyReached, senateReached)
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

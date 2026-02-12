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

// The 7 visual columns in the dual-track layout
type StageType = "shared" | "dual";
interface Stage {
  id: string;
  label: string;
  type: StageType;
  assemblyKey?: string;
  senateKey?: string;
  sharedKey?: string;
}

const STAGES: Stage[] = [
  { id: "introduced", label: "Introduced", type: "shared", sharedKey: "INTRODUCED" },
  { id: "committee", label: "Committee", type: "dual", assemblyKey: "IN_ASSEMBLY_COMM", senateKey: "IN_SENATE_COMM" },
  { id: "floor", label: "Floor", type: "dual", assemblyKey: "ASSEMBLY_FLOOR", senateKey: "SENATE_FLOOR" },
  { id: "passed", label: "Passed", type: "dual", assemblyKey: "PASSED_ASSEMBLY", senateKey: "PASSED_SENATE" },
  { id: "delivered", label: "Delivered", type: "shared", sharedKey: "DELIVERED_TO_GOV" },
  { id: "signed", label: "Signed", type: "shared", sharedKey: "SIGNED_BY_GOV" },
];

// Seal image paths
const SEAL_ASSEMBLY = "/nys-assembly-seal.avif";
const SEAL_SENATE = "/nys-senate-seal.avif";
const SEAL_NYS = "/nys-seal.avif";

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

// Connector between two stages: filled if both sides are reached
function isConnectorFilled(stageIdx: number, assemblyReached: Set<string>, senateReached: Set<string>): boolean {
  return isStageReached(STAGES[stageIdx], assemblyReached, senateReached) &&
    isStageReached(STAGES[stageIdx + 1], assemblyReached, senateReached);
}

// Node component for a single milestone node
function MilestoneNode({
  reached,
  isCurrent,
  sealSrc,
  alt,
  size = 20,
}: {
  reached: boolean;
  isCurrent: boolean;
  sealSrc: string;
  alt: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 transition-all",
        isCurrent && reached
          ? "ring-[3px] ring-primary/30"
          : "",
      )}
      style={{ width: size + 8, height: size + 8 }}
    >
      <img
        src={sealSrc}
        alt={alt}
        className={cn(
          "rounded-full object-contain transition-all",
          reached ? "opacity-100" : "opacity-25 grayscale"
        )}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export const BillMilestones = ({
  milestones,
  companionMilestones,
  chamber,
}: BillMilestonesProps) => {
  if (!milestones || milestones.length === 0) return null;

  // Build reached sets: the originating bill's milestones apply to its chamber
  const originatingReached = buildReachedSet(milestones);
  const companionReached = buildReachedSet(companionMilestones);

  // Map to assembly/senate based on the originating chamber
  const assemblyReached = chamber === "assembly" ? originatingReached : companionReached;
  const senateReached = chamber === "senate" ? originatingReached : companionReached;

  const furthestIdx = getFurthestStageIndex(assemblyReached, senateReached);

  // Check if any companion milestones exist (for showing the dual track)
  const hasCompanion = companionMilestones.length > 0;

  return (
    <Card className="card bg-card rounded-xl shadow-sm border">
      <CardContent className="px-4 sm:px-8 py-6">
        {/* Desktop layout */}
        <div className="hidden sm:block">
          <div className="flex items-stretch">
            {STAGES.map((stage, idx) => {
              const stageReached = isStageReached(stage, assemblyReached, senateReached);
              const isFurthest = idx === furthestIdx;

              return (
                <div key={stage.id} className="flex items-stretch flex-1 min-w-0 last:flex-none">
                  {/* Stage column */}
                  <div className="flex flex-col items-center">
                    {stage.type === "shared" ? (
                      /* Shared stage: single centered node */
                      <div className="flex flex-col items-center">
                        {/* Top spacer for alignment with dual track top row */}
                        {hasCompanion && <div className="h-[18px]" />}
                        <MilestoneNode
                          reached={stageReached}
                          isCurrent={isFurthest}
                          sealSrc={SEAL_NYS}
                          alt="NYS Seal"
                          size={24}
                        />
                        {/* Bottom spacer for alignment with dual track bottom row */}
                        {hasCompanion && <div className="h-[18px]" />}
                        <p
                          className={cn(
                            "mt-2 text-xs font-medium whitespace-nowrap text-center",
                            stageReached ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {stage.label}
                        </p>
                      </div>
                    ) : (
                      /* Dual stage: Assembly top, Senate bottom */
                      <div className="flex flex-col items-center gap-0">
                        {/* Assembly node (top) */}
                        {hasCompanion ? (
                          <MilestoneNode
                            reached={assemblyReached.has(stage.assemblyKey!)}
                            isCurrent={isFurthest && assemblyReached.has(stage.assemblyKey!)}
                            sealSrc={SEAL_ASSEMBLY}
                            alt="Assembly"
                            size={20}
                          />
                        ) : chamber === "assembly" ? (
                          <MilestoneNode
                            reached={assemblyReached.has(stage.assemblyKey!)}
                            isCurrent={isFurthest && assemblyReached.has(stage.assemblyKey!)}
                            sealSrc={SEAL_ASSEMBLY}
                            alt="Assembly"
                            size={20}
                          />
                        ) : (
                          /* No companion, and bill is senate: show muted assembly placeholder */
                          <MilestoneNode
                            reached={false}
                            isCurrent={false}
                            sealSrc={SEAL_ASSEMBLY}
                            alt="Assembly"
                            size={20}
                          />
                        )}

                        {/* Vertical connector between assembly and senate */}
                        <div
                          className={cn(
                            "w-px h-2",
                            (assemblyReached.has(stage.assemblyKey!) && senateReached.has(stage.senateKey!))
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          )}
                        />

                        {/* Senate node (bottom) */}
                        {hasCompanion ? (
                          <MilestoneNode
                            reached={senateReached.has(stage.senateKey!)}
                            isCurrent={isFurthest && senateReached.has(stage.senateKey!)}
                            sealSrc={SEAL_SENATE}
                            alt="Senate"
                            size={20}
                          />
                        ) : chamber === "senate" ? (
                          <MilestoneNode
                            reached={senateReached.has(stage.senateKey!)}
                            isCurrent={isFurthest && senateReached.has(stage.senateKey!)}
                            sealSrc={SEAL_SENATE}
                            alt="Senate"
                            size={20}
                          />
                        ) : (
                          <MilestoneNode
                            reached={false}
                            isCurrent={false}
                            sealSrc={SEAL_SENATE}
                            alt="Senate"
                            size={20}
                          />
                        )}

                        <p
                          className={cn(
                            "mt-2 text-xs font-medium whitespace-nowrap text-center",
                            stageReached ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {stage.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Horizontal connector to next stage */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex flex-col justify-center flex-1 min-w-2 px-1">
                      {stage.type === "shared" && STAGES[idx + 1].type === "dual" ? (
                        /* Fork: shared → dual (Introduced → Committee) */
                        <div className="flex flex-col items-stretch relative">
                          {hasCompanion && <div className="h-[18px]" />}
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "flex-1 h-0.5",
                                isConnectorFilled(idx, assemblyReached, senateReached)
                                  ? "bg-primary"
                                  : stageReached
                                  ? "bg-primary/40"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          </div>
                          {hasCompanion && <div className="h-[18px]" />}
                        </div>
                      ) : stage.type === "dual" && STAGES[idx + 1].type === "shared" ? (
                        /* Merge: dual → shared (Passed → Delivered) */
                        <div className="flex flex-col items-stretch relative">
                          {hasCompanion && <div className="h-[18px]" />}
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "flex-1 h-0.5",
                                isConnectorFilled(idx, assemblyReached, senateReached)
                                  ? "bg-primary"
                                  : stageReached
                                  ? "bg-primary/40"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          </div>
                          {hasCompanion && <div className="h-[18px]" />}
                        </div>
                      ) : stage.type === "dual" && STAGES[idx + 1].type === "dual" ? (
                        /* Dual → dual (Committee → Floor, Floor → Passed) */
                        <div className="flex flex-col items-stretch">
                          {/* Assembly connector (top) */}
                          <div className="flex items-center" style={{ height: 28 }}>
                            <div
                              className={cn(
                                "flex-1 h-0.5",
                                assemblyReached.has(stage.assemblyKey!) && assemblyReached.has(STAGES[idx + 1].assemblyKey!)
                                  ? "bg-primary"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          </div>
                          {/* Gap for vertical connector */}
                          <div className="h-2" />
                          {/* Senate connector (bottom) */}
                          <div className="flex items-center" style={{ height: 28 }}>
                            <div
                              className={cn(
                                "flex-1 h-0.5",
                                senateReached.has(stage.senateKey!) && senateReached.has(STAGES[idx + 1].senateKey!)
                                  ? "bg-primary"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          </div>
                        </div>
                      ) : (
                        /* Shared → shared (Delivered → Signed) */
                        <div className="flex flex-col items-stretch">
                          {hasCompanion && <div className="h-[18px]" />}
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "flex-1 h-0.5",
                                isConnectorFilled(idx, assemblyReached, senateReached)
                                  ? "bg-primary"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          </div>
                          {hasCompanion && <div className="h-[18px]" />}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile layout - compact stacked version */}
        <div className="sm:hidden">
          <div className="flex items-stretch overflow-x-auto pb-2">
            {STAGES.map((stage, idx) => {
              const stageReached = isStageReached(stage, assemblyReached, senateReached);
              const isFurthest = idx === furthestIdx;

              return (
                <div key={stage.id} className="flex items-stretch flex-1 min-w-0 last:flex-none">
                  <div className="flex flex-col items-center">
                    {stage.type === "shared" ? (
                      <div className="flex flex-col items-center">
                        {hasCompanion && <div className="h-[14px]" />}
                        <MilestoneNode
                          reached={stageReached}
                          isCurrent={isFurthest}
                          sealSrc={SEAL_NYS}
                          alt="NYS"
                          size={18}
                        />
                        {hasCompanion && <div className="h-[14px]" />}
                        <p
                          className={cn(
                            "mt-1 text-[10px] font-medium whitespace-nowrap text-center",
                            stageReached ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {stage.label}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0">
                        <MilestoneNode
                          reached={assemblyReached.has(stage.assemblyKey!)}
                          isCurrent={isFurthest && assemblyReached.has(stage.assemblyKey!)}
                          sealSrc={SEAL_ASSEMBLY}
                          alt="Assembly"
                          size={16}
                        />
                        <div
                          className={cn(
                            "w-px h-1",
                            (assemblyReached.has(stage.assemblyKey!) && senateReached.has(stage.senateKey!))
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          )}
                        />
                        <MilestoneNode
                          reached={senateReached.has(stage.senateKey!)}
                          isCurrent={isFurthest && senateReached.has(stage.senateKey!)}
                          sealSrc={SEAL_SENATE}
                          alt="Senate"
                          size={16}
                        />
                        <p
                          className={cn(
                            "mt-1 text-[10px] font-medium whitespace-nowrap text-center",
                            stageReached ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {stage.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile connector */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex items-center flex-1 min-w-1 px-0.5">
                      <div
                        className={cn(
                          "flex-1 h-0.5",
                          isStageReached(stage, assemblyReached, senateReached) &&
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

import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

interface MemberStatusProgressProps {
  member: Member;
}

export const MemberStatusProgress = ({ member }: MemberStatusProgressProps) => {
  const getLatestAction = () => {
    if (member.committee_id) return "COMMITTEE ASSIGNED";
    if (member.chamber) return "CHAMBER VERIFIED";
    return "MEMBER REGISTERED";
  };

  const getMemberStatus = () => {
    if (member.committee_id && member.chamber) return 4; // Active
    if (member.chamber) return 3; // Verified
    if (member.people_id) return 2; // Registered
    return 1; // Draft
  };

  const getStatusSteps = () => {
    const currentStatus = getMemberStatus();
    return [
      { number: 1, label: "Registered", active: currentStatus >= 1 },
      { number: 2, label: "Verified", active: currentStatus >= 2 },
      { number: 3, label: "Committee", active: currentStatus >= 3 },
      { number: 4, label: "Active", active: currentStatus >= 4 },
      { number: 5, label: "Leadership", active: member.role?.toLowerCase().includes("leader") || member.role?.toLowerCase().includes("chair") }
    ];
  };

  const statusSteps = getStatusSteps();

  return (
    <div className="space-y-6">
      <div className="w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6 gap-2 min-w-0">
          {statusSteps.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center flex-1 min-w-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                step.active 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                {step.active ? '✓' : step.number}
              </div>
              <span className="text-xs text-center mt-2 truncate w-full">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4">
        <div className="text-sm font-medium text-muted-foreground mb-1">Latest Action</div>
        <div className="font-semibold text-foreground break-words">{getLatestAction()}</div>
      </div>
    </div>
  );
};
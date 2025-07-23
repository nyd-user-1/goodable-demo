import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { 
  MemberInformation, 
  MemberStatusProgress, 
  MemberTabs 
} from "./features/members";

type Member = Tables<"People">;

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
}

export const MemberDetail = ({ member, onBack }: MemberDetailProps) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Section */}
        <div className="pb-6">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Members</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Member Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <MemberInformation member={member} />
          </CardContent>
        </Card>

        {/* Member Tabs Section */}
        <section>
          <MemberTabs member={member} />
        </section>
      </div>
    </div>
  );
};
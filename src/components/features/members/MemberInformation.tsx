
import { useNavigate } from "react-router-dom";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import {
  MapPin,
  Phone,
  Mail,
  User
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useMemberFavorites } from "@/hooks/useMemberFavorites";
import { supabase } from "@/integrations/supabase/client";

type Member = Tables<"People">;

interface MemberInformationProps {
  member: Member;
}

export const MemberInformation = ({ member }: MemberInformationProps) => {
  const navigate = useNavigate();
  const { favoriteMemberIds, toggleFavorite } = useMemberFavorites();
  const memberName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`;

  const isFavorited = favoriteMemberIds.has(member.people_id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(member.people_id);
  };

  const handleAIAnalysis = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Create a new chat session for this member
      const sessionData = {
        user_id: user.id,
        member_id: member.people_id,
        title: `Chat about ${memberName}`,
        messages: JSON.stringify([])
      };

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Navigate to the new chat with the initial prompt
      const initialPrompt = `Tell me about ${memberName}`;
      navigate(`/c/${data.id}?prompt=${encodeURIComponent(initialPrompt)}`);
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };
  
  return (
    <>
      <div className="space-y-6 relative">
        {/* Action Buttons - Top Right Corner */}
        <div className="absolute top-0 right-0 z-10">
          <CardActionButtons
            onFavorite={handleFavorite}
            onAIAnalysis={handleAIAnalysis}
            isFavorited={isFavorited}
            hasAIChat={false}
          />
        </div>

        {/* Member Name Header */}
        <div className="pb-4 border-b pr-20">
          <h1 className="text-2xl font-semibold text-foreground">{memberName}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Party & Chamber */}
            {(member.party || member.chamber) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <User className="h-4 w-4" />
                  <span>Party & Chamber</span>
                </div>
                <div className="text-muted-foreground ml-6">
                  {member.party && member.chamber ? `${member.party} - ${member.chamber}` : member.party || member.chamber}
                </div>
              </div>
            )}

            {/* District */}
            {member.district && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <MapPin className="h-4 w-4" />
                  <span>District</span>
                </div>
                 <div className="text-muted-foreground ml-6">
                   {member.district}
                 </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Email */}
            {member.email && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <div className="text-muted-foreground ml-6">
                  <a 
                    href={`mailto:${member.email}`} 
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    {member.email}
                  </a>
                </div>
              </div>
            )}

            {/* Phone */}
            {(member.phone_capitol || member.phone_district) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </div>
                <div className="text-muted-foreground ml-6 space-y-1">
                  {member.phone_capitol && (
                    <div>Capitol: {member.phone_capitol}</div>
                  )}
                  {member.phone_district && (
                    <div>District: {member.phone_district}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

import { Link, useNavigate } from "react-router-dom";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import {
  Building2,
  Users,
  FileText,
  Mail,
  Globe
} from "lucide-react";
import { useCommitteeFavorites } from "@/hooks/useCommitteeFavorites";
import { supabase } from "@/integrations/supabase/client";

type Committee = {
  committee_id: number;
  name: string;
  memberCount: string;
  billCount: string;
  description?: string;
  chair_name?: string;
  chair_email?: string;
  chamber: string;
  committee_url?: string;
  meeting_schedule?: string;
  next_meeting?: string;
  upcoming_agenda?: string;
  address?: string;
  slug?: string;
};

interface CommitteeInformationProps {
  committee: Committee;
}

export const CommitteeInformation = ({ committee }: CommitteeInformationProps) => {
  const navigate = useNavigate();
  const { favoriteCommitteeIds, toggleFavorite } = useCommitteeFavorites();

  const isFavorited = favoriteCommitteeIds.has(committee.committee_id);

  // Generate member slug from chair name
  const generateMemberSlugFromName = (name: string): string => {
    // Split name into parts and filter out single-letter parts (middle initials)
    const nameParts = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .split(/\s+/) // Split on whitespace
      .filter(part => part.length > 1); // Remove single-letter parts (middle initials)

    // Join with hyphens
    return nameParts
      .join('-')
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
  };

  const chairSlug = committee.chair_name ? generateMemberSlugFromName(committee.chair_name) : null;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(committee.committee_id);
  };

  const handleAIAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to chat with prompt - the chat page will create the session
    const initialPrompt = `Tell me about the ${committee.chamber} ${committee.name} committee`;
    navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
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

        {/* Committee Name Header */}
        <div className="pb-4 border-b pr-20">
          <h1 className="text-2xl font-semibold text-foreground">{committee.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Chamber */}
            {committee.chamber && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Building2 className="h-4 w-4" />
                  <span>Chamber</span>
                </div>
                <div className="text-muted-foreground ml-6">
                  {committee.chamber}
                </div>
              </div>
            )}

            {/* Members Count */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </div>
              <div className="text-muted-foreground ml-6">
                {committee.memberCount || '0'} {parseInt(committee.memberCount || '0') === 1 ? 'member' : 'members'}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Chair */}
            {committee.chair_name && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Users className="h-4 w-4" />
                  <span>Committee Chair</span>
                </div>
                <div className="ml-6">
                  {chairSlug ? (
                    <Link
                      to={`/members/${chairSlug}`}
                      className="text-primary hover:text-primary/80 hover:underline"
                    >
                      {committee.chair_name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">{committee.chair_name}</span>
                  )}
                </div>
              </div>
            )}

            {/* Chair Email */}
            {committee.chair_email && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Mail className="h-4 w-4" />
                  <span>Chair Email</span>
                </div>
                <div className="text-muted-foreground ml-6">
                  <a
                    href={`mailto:${committee.chair_email}`}
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    {committee.chair_email}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {committee.committee_url && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </div>
                <div className="text-muted-foreground ml-6">
                  <a
                    href={committee.committee_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    View Committee Page
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Clock,
  StickyNote
} from "lucide-react";

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
  hasNotes?: boolean;
}

export const CommitteeInformation = ({ committee, hasNotes = false }: CommitteeInformationProps) => {
  // Get chamber seal image
  const chamberSeal = committee.chamber?.toLowerCase() === 'senate'
    ? '/nys-senate-seal.png'
    : '/nys-assembly-seal.png';

  // Get full committee name with chamber prefix
  const fullCommitteeName = committee.chamber
    ? `${committee.chamber} ${committee.name}`
    : committee.name;

  // Generate member slug from chair name
  const generateMemberSlugFromName = (name: string): string => {
    const nameParts = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(part => part.length > 1);

    return nameParts
      .join('-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const chairSlug = committee.chair_name ? generateMemberSlugFromName(committee.chair_name) : null;

  return (
    <>
      <div className="space-y-6 relative">
        {/* Has Note Badge - Top Right Corner */}
        {hasNotes && (
          <div className="absolute top-0 right-0 z-10">
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
            >
              <StickyNote className="h-3 w-3 mr-1" />
              Has Note
            </Badge>
          </div>
        )}

        {/* Committee Name Header with Seal */}
        <div className={`pb-4 border-b ${hasNotes ? 'pr-24' : ''}`}>
          <div className="flex items-center gap-4">
            <img
              src={chamberSeal}
              alt={`${committee.chamber} seal`}
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-2xl font-semibold text-foreground">{fullCommitteeName}</h1>
          </div>
        </div>

        {/* Description if available */}
        {committee.description && (
          <div className="text-muted-foreground text-sm leading-relaxed">
            {committee.description}
          </div>
        )}

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

            {/* Address */}
            {committee.address && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </div>
                <div className="text-muted-foreground ml-6">
                  {committee.address}
                </div>
              </div>
            )}

            {/* Meeting Schedule */}
            {committee.meeting_schedule && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>Meeting Schedule</span>
                </div>
                <div className="text-muted-foreground ml-6">
                  {committee.meeting_schedule}
                </div>
              </div>
            )}
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

            {/* Next Meeting */}
            {committee.next_meeting && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Clock className="h-4 w-4" />
                  <span>Next Meeting</span>
                </div>
                <div className="text-muted-foreground ml-6">
                  {committee.next_meeting}
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

        {/* Upcoming Agenda */}
        {committee.upcoming_agenda && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Calendar className="h-4 w-4" />
              <span>Upcoming Agenda</span>
            </div>
            <div className="text-muted-foreground ml-6 whitespace-pre-wrap">
              {committee.upcoming_agenda}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

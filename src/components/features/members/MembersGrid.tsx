
import { MemberCard } from "./MemberCard";

type Member = {
  people_id: number;
  name: string | null;
  party: string | null;
  chamber: string | null;
  district: string | null;
  role: string | null;
  email: string | null;
  phone_capitol: string | null;
  address: string | null;
  photo_url: string | null;
  bio_short: string | null;
};

interface MembersGridProps {
  members: Member[];
  onMemberSelect: (member: Member) => void;
  onFavorite?: (member: Member, e: React.MouseEvent) => void;
  onAIAnalysis?: (member: Member, e: React.MouseEvent) => void;
  favoriteMembers?: Set<number>;
  membersWithAIChat?: Set<number>;
}

export const MembersGrid = ({
  members,
  onMemberSelect,
  onFavorite,
  onAIAnalysis,
  favoriteMembers = new Set(),
  membersWithAIChat = new Set()
}: MembersGridProps) => {
  return (
    <section className="grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <MemberCard
          key={member.people_id}
          member={member}
          onMemberSelect={onMemberSelect}
          onFavorite={onFavorite}
          onAIAnalysis={onAIAnalysis}
          isFavorited={favoriteMembers.has(member.people_id)}
          hasAIChat={membersWithAIChat.has(member.people_id)}
        />
      ))}
    </section>
  );
};

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMembersData } from "@/hooks/useMembersData";
import { useMemberFavorites } from "@/hooks/useMemberFavorites";
import { MembersHeader } from "@/components/features/members/MembersHeader";
import { MembersSearchFilters } from "@/components/features/members/MembersSearchFilters";
import { MembersGrid } from "@/components/features/members/MembersGrid";
import { MembersEmptyState } from "@/components/features/members/MembersEmptyState";
import { MembersLoadingSkeleton } from "@/components/features/members/MembersLoadingSkeleton";
import { MembersErrorState } from "@/components/features/members/MembersErrorState";
import { MemberDetail } from "@/components/MemberDetail";
import { AIChatSheet } from "@/components/AIChatSheet";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Members = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMemberForChat, setSelectedMemberForChat] = useState<any>(null);
  const [membersWithAIChat, setMembersWithAIChat] = useState<Set<number>>(new Set());

  const { favoriteMemberIds, toggleFavorite } = useMemberFavorites();

  const {
    members,
    loading,
    error,
    chambers,
    parties,
    districts,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    partyFilter,
    setPartyFilter,
    districtFilter,
    setDistrictFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    fetchMembers,
  } = useMembersData();

  // Handle URL parameter for selected member
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      // First check if member is in current filtered results
      if (members && members.length > 0) {
        const member = members.find(m => m.people_id.toString() === selectedId);
        if (member) {
          setSelectedMember(member);
          return;
        }
      }
      
      // If not found in filtered results, fetch directly from database
      const fetchSelectedMember = async () => {
        try {
          const { data: member } = await supabase
            .from('People')
            .select('*')
            .eq('people_id', parseInt(selectedId))
            .single();
          
          if (member) {
            setSelectedMember(member);
          }
        } catch (error) {
        }
      };
      
      fetchSelectedMember();
    } else {
      setSelectedMember(null);
    }
  }, [searchParams, members]);

  // Fetch members that have AI chat sessions
  useEffect(() => {
    const fetchMembersWithAIChat = async () => {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("member_id")
          .not("member_id", "is", null);

        if (sessions) {
          const memberIdsWithChat = new Set(
            sessions.map((session: any) => session.member_id).filter(Boolean)
          );
          setMembersWithAIChat(memberIdsWithChat);
        }
      } catch (error) {
      }
    };

    fetchMembersWithAIChat();
  }, []);

  const handleFavorite = async (member: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(member.people_id);
  };

  const handleAIAnalysis = (member: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMemberForChat(member);
    setChatOpen(true);
    
    // Add this member to the set of members with AI chat
    setMembersWithAIChat(prev => new Set([...prev, member.people_id]));
  };

  const handleFiltersChange = (newFilters: {
    search: string;
    party: string;
    district: string;
    chamber: string;
  }) => {
    setSearchTerm(newFilters.search);
    setPartyFilter(newFilters.party === "" ? "all" : newFilters.party);
    setDistrictFilter(newFilters.district === "" ? "all" : newFilters.district);
    setChamberFilter(newFilters.chamber === "" ? "all" : newFilters.chamber);
  };

  if (loading) {
    return <MembersLoadingSkeleton />;
  }

  if (error) {
    return <MembersErrorState error={error} onRetry={fetchMembers} />;
  }

  // Show member detail if one is selected
  if (selectedMember) {
    return (
      <MemberDetail 
        member={selectedMember} 
        onBack={() => {
          setSelectedMember(null);
          navigate('/members');
        }} 
      />
    );
  }

  const hasFilters = searchTerm !== "" || chamberFilter !== "all" || partyFilter !== "all" || districtFilter !== "all";

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <MembersHeader 
            membersCount={members.length} 
            chambersCount={chambers.length} 
          />

          <MembersSearchFilters
            filters={{
              search: searchTerm,
              party: partyFilter === "all" ? "" : partyFilter,
              district: districtFilter === "all" ? "" : districtFilter,
              chamber: chamberFilter === "all" ? "" : chamberFilter,
            }}
            onFiltersChange={handleFiltersChange}
            chambers={chambers}
            parties={parties}
            districts={districts}
          />

          {members.length === 0 ? (
            <MembersEmptyState hasFilters={hasFilters} />
          ) : (
            <>
              <MembersGrid 
                members={members} 
                onMemberSelect={setSelectedMember}
                onFavorite={handleFavorite}
                onAIAnalysis={handleAIAnalysis}
                favoriteMembers={favoriteMemberIds}
                membersWithAIChat={membersWithAIChat}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        member={selectedMemberForChat}
      />
    </>
  );
}

export default Members;
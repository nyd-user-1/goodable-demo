import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useMembersData } from "@/hooks/useMembersData";
import { generateMemberSlug, slugToNamePattern } from "@/utils/memberSlug";
import { useMemberFavorites } from "@/hooks/useMemberFavorites";
import { MembersHeader } from "@/components/features/members/MembersHeader";
import { MembersSearchFilters } from "@/components/features/members/MembersSearchFilters";
import { MembersGrid } from "@/components/features/members/MembersGrid";
import { MembersEmptyState } from "@/components/features/members/MembersEmptyState";
import { MembersLoadingSkeleton } from "@/components/features/members/MembersLoadingSkeleton";
import { MembersErrorState } from "@/components/features/members/MembersErrorState";
import { MemberDetail } from "@/components/MemberDetail";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type Member = Tables<"People">;

const Members = () => {
  const [searchParams] = useSearchParams();
  const { memberSlug } = useParams<{ memberSlug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loadingSlug, setLoadingSlug] = useState(!!memberSlug); // True if we have a slug to resolve
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

  // Handle URL parameter for selected member (legacy support for ?selected=id)
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

  // Handle URL parameter for member slug (/members/:memberSlug)
  useEffect(() => {
    const fetchMemberBySlug = async () => {
      if (memberSlug) {
        setLoadingSlug(true);
        try {
          const namePattern = slugToNamePattern(memberSlug);

          // Fetch all members and do flexible client-side matching
          const { data: allMembers, error } = await supabase
            .from("People")
            .select("*");

          if (error) throw error;

          let matchedMember = null;

          if (allMembers && allMembers.length > 0) {
            const nameParts = namePattern.split(' ').filter(part => part.length > 0);
            // Filter out single-letter parts (likely middle initials) for core matching
            const significantParts = nameParts.filter(part => part.length > 1);

            // Strategy 1: Exact case-insensitive partial match (try with full pattern first)
            matchedMember = allMembers.find(m =>
              m.name?.toLowerCase().includes(namePattern.toLowerCase())
            );

            // Strategy 2: Match using significant parts only (ignoring middle initials)
            if (!matchedMember && significantParts.length > 0) {
              matchedMember = allMembers.find(m => {
                const memberName = m.name?.toLowerCase() || '';
                // Match if all significant parts are in the member name
                return significantParts.every(part => memberName.includes(part));
              });
            }

            // Strategy 3: Match by first and last name from database fields
            if (!matchedMember && significantParts.length >= 2) {
              const firstName = significantParts[0];
              const lastName = significantParts[significantParts.length - 1];
              matchedMember = allMembers.find(m => {
                const memberLastName = m.last_name?.toLowerCase() || '';
                const memberFirstName = m.first_name?.toLowerCase() || '';
                // Match if both first and last names match
                return (
                  memberLastName.includes(lastName) &&
                  memberFirstName.includes(firstName)
                );
              });
            }

            // Strategy 4: Match by last name and first initial only (most flexible)
            if (!matchedMember && nameParts.length >= 2) {
              const firstName = nameParts[0];
              const lastName = nameParts[nameParts.length - 1];
              matchedMember = allMembers.find(m => {
                const memberLastName = m.last_name?.toLowerCase() || '';
                const memberFirstName = m.first_name?.toLowerCase() || '';
                // Match if last name matches and first name starts with first letter
                return (
                  memberLastName.includes(lastName) &&
                  memberFirstName.startsWith(firstName[0])
                );
              });
            }
          }

          if (matchedMember) {
            setSelectedMember(matchedMember);
          } else {
            console.error("Member not found:", memberSlug, "Pattern:", namePattern);
          }
        } catch (error) {
          console.error("Error fetching member:", error);
        } finally {
          setLoadingSlug(false);
        }
      } else {
        // If no memberSlug in URL, clear selected member
        setSelectedMember(null);
        setLoadingSlug(false);
      }
    };

    fetchMemberBySlug();
  }, [memberSlug]);

  // Scroll to top when member is selected or deselected
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedMember]);

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
    if (!user) {
      navigate('/auth-2');
      return;
    }
    await toggleFavorite(member.people_id);
  };

  const handleAIAnalysis = async (member: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth-2');
      return;
    }

    try {
      // Create a new chat session for this member
      const sessionData = {
        user_id: user.id,
        member_id: member.people_id,
        title: `Chat about ${member.name || 'Member'}`,
        messages: JSON.stringify([])
      };

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Navigate to the new chat with the initial prompt
      const initialPrompt = `Tell me about ${member.name}`;
      navigate(`/c/${data.id}?prompt=${encodeURIComponent(initialPrompt)}`);

      // Add this member to the set of members with AI chat
      setMembersWithAIChat(prev => new Set([...prev, member.people_id]));
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  const handleFiltersChange = (newFilters: {
    search: string;
    party: string;
    district: string;
    chamber: string;
  }) => {
    if (!user) {
      navigate('/auth-2');
      return;
    }
    setSearchTerm(newFilters.search);
    setPartyFilter(newFilters.party === "" ? "all" : newFilters.party);
    setDistrictFilter(newFilters.district === "" ? "all" : newFilters.district);
    setChamberFilter(newFilters.chamber === "" ? "all" : newFilters.chamber);
  };

  if (loading || loadingSlug) {
    return <MembersLoadingSkeleton />;
  }

  if (error) {
    return <MembersErrorState error={error} onRetry={fetchMembers} />;
  }

  // Member navigation logic
  const getAllMembers = () => {
    // Get all members sorted alphabetically by last name (same as main list)
    return [...members].sort((a, b) => a.last_name.localeCompare(b.last_name));
  };

  const getMemberNavigation = () => {
    if (!selectedMember) return { hasPrevious: false, hasNext: false };
    
    const allMembers = getAllMembers();
    const currentIndex = allMembers.findIndex(m => m.people_id === selectedMember.people_id);
    
    return {
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < allMembers.length - 1,
      previousMember: currentIndex > 0 ? allMembers[currentIndex - 1] : null,
      nextMember: currentIndex < allMembers.length - 1 ? allMembers[currentIndex + 1] : null
    };
  };

  const navigateToMember = (member: any) => {
    const slug = generateMemberSlug(member);
    navigate(`/members/${slug}`);
  };

  const navigation = getMemberNavigation();

  // Show member detail if one is selected
  if (selectedMember) {
    return (
      <MemberDetail 
        member={selectedMember} 
        onBack={() => {
          setSelectedMember(null);
          navigate('/members');
        }}
        onPrevious={navigation.previousMember ? () => navigateToMember(navigation.previousMember) : undefined}
        onNext={navigation.nextMember ? () => navigateToMember(navigation.nextMember) : undefined}
        hasPrevious={navigation.hasPrevious}
        hasNext={navigation.hasNext}
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

          {user ? (
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
          ) : (
            <div className="text-center py-8">
              <Button onClick={() => navigate('/auth-2')}>
                Sign in to search and filter members
              </Button>
            </div>
          )}

          {members.length === 0 ? (
            <MembersEmptyState hasFilters={hasFilters} />
          ) : (
            <>
              <MembersGrid
                members={members}
                onMemberSelect={user ? navigateToMember : () => navigate('/auth-2')}
                onFavorite={handleFavorite}
                onAIAnalysis={handleAIAnalysis}
                favoriteMembers={favoriteMemberIds}
                membersWithAIChat={membersWithAIChat}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && user && (
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
    </>
  );
}

export default Members;
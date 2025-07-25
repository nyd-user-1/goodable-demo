import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCommitteesData } from "@/hooks/useCommitteesData";
import { useCommitteeFavorites } from "@/hooks/useCommitteeFavorites";
import { CommitteesHeader } from "@/components/features/committees/CommitteesHeader";
import { CommitteesSearchFilters } from "@/components/features/committees/CommitteesSearchFilters";
import { CommitteesGrid } from "@/components/features/committees/CommitteesGrid";
import { CommitteesEmptyState } from "@/components/features/committees/CommitteesEmptyState";
import { CommitteesLoadingSkeleton } from "@/components/features/committees/CommitteesLoadingSkeleton";
import { CommitteesErrorState } from "@/components/features/committees/CommitteesErrorState";
import { CommitteeDetail } from "@/components/CommitteeDetail";
import { AIChatSheet } from "@/components/AIChatSheet";
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

const Committees = () => {
  const [searchParams] = useSearchParams();
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedCommitteeForChat, setSelectedCommitteeForChat] = useState<Committee | null>(null);
  const [committeesWithAIChat, setCommitteesWithAIChat] = useState<Set<number>>(new Set());

  const { favoriteCommitteeIds, toggleFavorite } = useCommitteeFavorites();

  const {
    committees,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    fetchCommittees,
    totalCommittees,
    filteredCount,
    chambers,
  } = useCommitteesData();

  // Handle URL parameter for selected committee
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && committees && committees.length > 0) {
      const committee = committees.find(c => c.committee_id.toString() === selectedId);
      if (committee) {
        setSelectedCommittee(committee);
      }
    }
  }, [searchParams, committees]);

  // Fetch committees that have AI chat sessions
  useEffect(() => {
    const fetchCommitteesWithAIChat = async () => {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("committee_id")
          .not("committee_id", "is", null);

        if (sessions) {
          const committeeIdsWithChat = new Set(
            sessions.map((session: any) => session.committee_id).filter(Boolean)
          );
          setCommitteesWithAIChat(committeeIdsWithChat);
        }
      } catch (error) {
      }
    };

    fetchCommitteesWithAIChat();
  }, []);

  const handleFavorite = async (committee: Committee, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(committee.committee_id);
  };

  const handleAIAnalysis = (committee: Committee, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCommitteeForChat(committee);
    setChatOpen(true);
    
    // Add this committee to the set of committees with AI chat
    setCommitteesWithAIChat(prev => new Set([...prev, committee.committee_id]));
  };

  if (loading) {
    return <CommitteesLoadingSkeleton />;
  }

  if (error) {
    return <CommitteesErrorState error={error} onRetry={fetchCommittees} />;
  }

  // Show committee detail if one is selected
  if (selectedCommittee) {
    return (
      <CommitteeDetail 
        committee={selectedCommittee} 
        onBack={() => setSelectedCommittee(null)} 
      />
    );
  }

  const handleFiltersChange = (newFilters: {
    search: string;
  }) => {
    setSearchTerm(newFilters.search);
  };

  const hasFilters = searchTerm !== "";

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <CommitteesHeader 
            filteredCount={filteredCount}
            totalCount={totalCommittees}
            chamberFilter={chamberFilter}
            onChamberFilterChange={setChamberFilter}
            chambers={chambers}
          />

          <CommitteesSearchFilters
            filters={{
              search: searchTerm,
            }}
            onFiltersChange={handleFiltersChange}
          />

          {committees.length === 0 ? (
            <CommitteesEmptyState hasFilters={hasFilters} />
          ) : (
            <CommitteesGrid 
              committees={committees} 
              onCommitteeSelect={setSelectedCommittee}
              onFavorite={handleFavorite}
              onAIAnalysis={handleAIAnalysis}
              favoriteCommittees={favoriteCommitteeIds}
              committeesWithAIChat={committeesWithAIChat}
            />
          )}
        </div>
      </div>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        committee={selectedCommitteeForChat}
      />
    </>
  );
};

export default Committees;
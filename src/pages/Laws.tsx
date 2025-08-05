import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  LawsHeader, 
  LawsSearchFilters, 
  LawsGrid, 
  LawsLoadingSkeleton, 
  LawsEmptyState 
} from "@/components/features/laws";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Law {
  id: number;
  law_id: string;
  name: string;
  chapter: string;
  law_type: string;
  full_text?: string;
  structure?: any;
  total_sections: number;
  last_updated?: string;
  api_last_modified?: string;
  created_at: string;
  updated_at: string;
}

const Laws = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allLaws, setAllLaws] = useState<Law[]>([]);
  const [filteredLaws, setFilteredLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const LAWS_PER_PAGE = 50;

  // Fetch laws from database
  useEffect(() => {
    const fetchLaws = async () => {
      try {
        const { data, error } = await supabase
          .from("ny_laws")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setAllLaws(data || []);
        setFilteredLaws(data || []);
      } catch (err) {
        console.error("Error fetching laws:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, []);

  // Simple filtering
  useEffect(() => {
    let filtered = [...allLaws];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(law =>
        law.name.toLowerCase().includes(lowerSearchTerm) ||
        law.law_id.toLowerCase().includes(lowerSearchTerm) ||
        law.chapter.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (chapterFilter) {
      filtered = filtered.filter(law => law.chapter === chapterFilter);
    }

    setFilteredLaws(filtered);
    setCurrentPage(1);
  }, [allLaws, searchTerm, chapterFilter]);

  // Get available chapters
  const availableChapters = [...new Set(allLaws.map(law => law.chapter))].filter(Boolean).sort();
  const totalPages = Math.ceil(filteredLaws.length / LAWS_PER_PAGE);
  const hasFilters = searchTerm !== "" || chapterFilter !== "";

  // Paginate
  const startIndex = (currentPage - 1) * LAWS_PER_PAGE;
  const paginatedLaws = filteredLaws.slice(startIndex, startIndex + LAWS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleChapterChange = (value: string) => {
    setChapterFilter(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setChapterFilter("");
    setCurrentPage(1);
  };

  const handleLawSelect = (law: Law) => {
    if (!user) {
      navigate('/auth-2');
      return;
    }
    
    // For now, just show basic law details
    alert(`Selected: ${law.name} (${law.law_id})\nChapter: ${law.chapter}\nType: ${law.law_type}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <LawsLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <LawsHeader lawsCount={filteredLaws.length} />

        {user ? (
          <LawsSearchFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            chapterFilter={chapterFilter}
            onChapterChange={handleChapterChange}
            availableChapters={availableChapters}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="text-center py-8">
            <Button onClick={() => navigate('/auth-2')}>
              Sign in to search and filter laws
            </Button>
          </div>
        )}

        {paginatedLaws.length === 0 ? (
          <LawsEmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
        ) : (
          <>
            <LawsGrid 
              laws={paginatedLaws}
              onLawSelect={handleLawSelect}
            />
            
            {/* Pagination Controls */}
            {totalPages > 1 && user && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Results info */}
            {user && (
              <div className="text-center text-sm text-muted-foreground">
                Showing {((currentPage - 1) * LAWS_PER_PAGE) + 1} to {Math.min(currentPage * LAWS_PER_PAGE, filteredLaws.length)} of {filteredLaws.length} laws
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Laws;
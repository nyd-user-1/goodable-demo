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
import { useLawsData, Law } from "@/hooks/useLawsData";

const Laws = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    filteredLaws,
    totalFilteredCount,
    loading,
    searchTerm,
    setSearchTerm,
    chapterFilter,
    setChapterFilter,
    availableChapters,
    currentPage,
    setCurrentPage,
    totalPages,
    hasFilters,
    clearFilters,
    getLawDetails
  } = useLawsData();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleChapterChange = (value: string) => {
    setChapterFilter(value);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleLawSelect = async (law: Law) => {
    if (!user) {
      navigate('/auth-2');
      return;
    }
    
    // Get full law details with sections
    const lawDetails = await getLawDetails(law.law_id);
    if (lawDetails) {
      // For now, just show an alert with more details
      alert(`Selected: ${lawDetails.name} (${lawDetails.law_id})\nChapter: ${lawDetails.chapter}\nSections: ${lawDetails.total_sections}`);
    } else {
      alert(`Selected: ${law.name} (${law.law_id})`);
    }
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
        <LawsHeader lawsCount={totalFilteredCount} />

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

        {filteredLaws.length === 0 ? (
          <LawsEmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
        ) : (
          <>
            <LawsGrid 
              laws={filteredLaws}
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
                Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalFilteredCount)} of {totalFilteredCount} laws
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Laws;
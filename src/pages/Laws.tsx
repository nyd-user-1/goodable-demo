import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Law, laws } from "@/data/laws";
import { 
  LawsHeader, 
  LawsSearchFilters, 
  LawsGrid, 
  LawsLoadingSkeleton, 
  LawsEmptyState 
} from "@/components/features/laws";
import { useAuth } from "@/contexts/AuthContext";

const ITEMS_PER_PAGE = 50;

const Laws = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Simulate loading for consistency with other pages
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter laws based on search term
  const filteredLaws = useMemo(() => {
    if (!searchTerm) return laws;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return laws.filter(law => 
      law.name.toLowerCase().includes(lowerSearchTerm) ||
      law.code.toLowerCase().includes(lowerSearchTerm) ||
      law.fullName.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm]);

  // Paginate filtered laws
  const paginatedLaws = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLaws.slice(startIndex, endIndex);
  }, [filteredLaws, currentPage]);

  const totalPages = Math.ceil(filteredLaws.length / ITEMS_PER_PAGE);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleLawSelect = (law: Law) => {
    if (!user) {
      navigate('/auth-2');
      return;
    }
    // For now, just show an alert - you can implement law detail view later
    alert(`Selected: ${law.fullName} (${law.code})`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <LawsLoadingSkeleton />;
  }

  const hasFilters = searchTerm !== "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <LawsHeader lawsCount={filteredLaws.length} />

        {user ? (
          <LawsSearchFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
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
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLaws.length)} of {filteredLaws.length} laws
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Laws;
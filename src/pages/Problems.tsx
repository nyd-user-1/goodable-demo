import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProblemDetail } from "@/components/ProblemDetail";
import { problems, Problem } from "@/data/problems";
import { 
  ProblemsHeader, 
  ProblemsSearchFilters, 
  ProblemsGrid, 
  ProblemsLoadingSkeleton, 
  ProblemsErrorState, 
  ProblemsEmptyState 
} from "@/components/features/problems";

// Function to get consistent upvote count for a problem (matches ProblemCard logic)
const getUpvoteCount = (problem: Problem): number => {
  const seed = problem.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random1 = (seed * 9301 + 49297) % 233280;
  return Math.floor(random1 / 233280 * 80) + 20;
};

const Problems = () => {
  const [searchParams] = useSearchParams();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  // Sort problems by upvote count (highest first) before filtering
  const [sortedProblems] = useState(() => 
    [...problems].sort((a, b) => getUpvoteCount(b) - getUpvoteCount(a))
  );
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>(sortedProblems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Handle URL parameter for selected problem
  useEffect(() => {
    const selectedSlug = searchParams.get('selected');
    if (selectedSlug && sortedProblems.length > 0) {
      const problem = sortedProblems.find(p => p.slug === selectedSlug);
      if (problem) {
        setSelectedProblem(problem);
      }
    }
  }, [searchParams, sortedProblems]);

  // Filter problems based on search criteria
  useEffect(() => {
    let filtered = sortedProblems;

    if (searchTerm) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(problem => problem.category === categoryFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(problem => problem.priority === priorityFilter);
    }

    setFilteredProblems(filtered);
  }, [searchTerm, categoryFilter, priorityFilter]);

  const handleProblemSelect = (problem: Problem) => {
    setSelectedProblem(problem);
  };

  const handleBackToProblems = () => {
    setSelectedProblem(null);
  };

  const handleFiltersChange = (newFilters: {
    search: string;
    category: string;
    priority: string;
  }) => {
    setSearchTerm(newFilters.search);
    setCategoryFilter(newFilters.category);
    setPriorityFilter(newFilters.priority);
  };

  if (selectedProblem) {
    return (
      <ProblemDetail problem={selectedProblem} onBack={handleBackToProblems} />
    );
  }

  if (loading) {
    return <ProblemsLoadingSkeleton />;
  }

  if (error) {
    return <ProblemsErrorState error={error} onRetry={() => setError(null)} />;
  }

  const hasFilters = searchTerm !== "" || categoryFilter !== "" || priorityFilter !== "";

  // Get unique categories and priorities for filters
  const categories = [...new Set(sortedProblems.map(p => p.category))];
  const priorities = [...new Set(sortedProblems.map(p => p.priority))];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <ProblemsHeader problemsCount={filteredProblems.length} />
        
        <ProblemsSearchFilters
          filters={{
            search: searchTerm,
            category: categoryFilter,
            priority: priorityFilter,
          }}
          onFiltersChange={handleFiltersChange}
          categories={categories}
          priorities={priorities}
        />

        {filteredProblems.length === 0 ? (
          <ProblemsEmptyState hasFilters={hasFilters} />
        ) : (
          <div className="space-y-6">
            <ProblemsGrid problems={filteredProblems} onProblemSelect={handleProblemSelect} />
            
            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredProblems.length} of {sortedProblems.length} problems
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;
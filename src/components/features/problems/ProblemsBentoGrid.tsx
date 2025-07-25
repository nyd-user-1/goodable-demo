import { problems } from "@/data/problems";
import { useNavigate } from "react-router-dom";
import { ProblemCard } from "./ProblemCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ProblemsBentoGrid() {
  const navigate = useNavigate();
  
  // Get the first 9 problems
  const featuredProblems = problems.slice(0, 9);

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Featured Problems
            <span className="bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] bg-clip-text text-transparent"> We're Solving</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Join our community in tackling society's most pressing challenges through collaborative problem-solving
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onClick={() => navigate(`/problems/${problem.slug}`)}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/problems')}
            className="hover:bg-[#3D63DD] hover:text-white"
          >
            View All Problems
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
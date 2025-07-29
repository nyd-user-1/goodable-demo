import { problems } from "@/data/problems";
import { useNavigate } from "react-router-dom";
import { ProblemCard } from "./ProblemCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ProblemsBentoGrid() {
  const navigate = useNavigate();
  
  // Get the first 6 problems
  const featuredProblems = problems.slice(0, 6);

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Problem Statements
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            You decide what matters.
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

        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => {
              navigate('/problems');
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}
            className="hover:bg-muted"
          >
            Load More
          </Button>
          <Button
            onClick={() => {
              navigate('/problems');
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}
            className="bg-[#3D63DD] text-white hover:bg-[#2D53CD]"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
import { Users, Heart, Building2, Globe, Clock, Brain } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { cn } from "@/lib/utils";
import { problems } from "@/data/problems";
import { useNavigate } from "react-router-dom";

// Map categories to icons
const categoryIcons = {
  "Social Services": Users,
  "Social Connection": Heart,
  "Community Development": Building2,
  "Environment": Globe,
  "Technology": Brain,
  "Healthcare": Heart,
};

// Get icon for category, with fallback
const getIconForCategory = (category: string): React.ElementType => {
  return categoryIcons[category as keyof typeof categoryIcons] || Clock;
};

export function ProblemsBentoGrid() {
  const navigate = useNavigate();
  
  // Get the first 6 problems
  const featuredProblems = problems.slice(0, 6);

  const features = featuredProblems.map((problem, index) => {
    // Determine grid layout classes
    let gridClass = "col-span-1";
    if (index === 0 || index === 3) {
      gridClass = "col-span-1 lg:col-span-2"; // First and fourth items span 2 columns on large screens
    }

    return {
      Icon: getIconForCategory(problem.category),
      name: problem.title,
      description: problem.description,
      href: `/problems/${problem.slug}`,
      cta: "Explore Solutions",
      className: gridClass,
      background: (
        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                problem.priority === "urgent" && "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-400/20",
                problem.priority === "high" && "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-400/20",
                problem.priority === "normal" && "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-400/20",
                problem.priority === "low" && "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-400/20"
              )}>
                {problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)} Priority
              </span>
              <span className="text-xs text-muted-foreground">
                {problem.category}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="font-medium">{problem.subProblems} sub-problems</span>
              <span>•</span>
              <span className="font-medium">{problem.solutions} solutions</span>
            </div>
            {/* Show first statistic if available */}
            {problem.statistics && problem.statistics[0] && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="text-xs text-muted-foreground">{problem.statistics[0].label}</div>
                <div className="text-2xl font-bold text-foreground">{problem.statistics[0].value}</div>
              </div>
            )}
          </div>
        </div>
      ),
      onClick: () => navigate(`/problems/${problem.slug}`)
    };
  });

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
        
        <BentoGrid>
          {features.map((feature, idx) => (
            <div
              key={idx}
              onClick={feature.onClick}
              className="cursor-pointer"
            >
              <BentoCard {...feature} />
            </div>
          ))}
        </BentoGrid>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/problems')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#3D63DD] hover:text-[#2D53CD] transition-colors"
          >
            View All Problems
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
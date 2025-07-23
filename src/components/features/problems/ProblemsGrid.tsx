import { Problem } from "@/data/problems";
import { ProblemCard } from "./ProblemCard";

interface ProblemsGridProps {
  problems: Problem[];
  onProblemSelect: (problem: Problem) => void;
}

export const ProblemsGrid = ({ problems, onProblemSelect }: ProblemsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {problems.map((problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          onClick={() => onProblemSelect(problem)}
        />
      ))}
    </div>
  );
};
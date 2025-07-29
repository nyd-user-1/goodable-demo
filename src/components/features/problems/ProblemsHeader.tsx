interface ProblemsHeaderProps {
  problemsCount: number;
}

export const ProblemsHeader = ({ problemsCount }: ProblemsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">100 Problems</h1>
        <p className="text-muted-foreground">
          Explore the top 100 problems as agreed on by you.
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{problemsCount.toLocaleString()} problems</span>
      </div>
    </div>
  );
};
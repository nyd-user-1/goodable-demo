interface LawsHeaderProps {
  lawsCount: number;
}

export const LawsHeader = ({ lawsCount }: LawsHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">
        Laws
      </h1>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{lawsCount} consolidated laws found</span>
      </div>
    </div>
  );
};
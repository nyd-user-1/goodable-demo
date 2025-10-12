interface BillsHeaderProps {
  billsCount: number | string; // Accept both number and string for flexibility
}

export const BillsHeader = ({ billsCount }: BillsHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">
        Bills
      </h1>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{billsCount} bills found</span>
      </div>
    </div>
  );
};
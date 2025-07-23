import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CommitteesHeaderProps {
  filteredCount: number;
  totalCount: number;
  chamberFilter: string;
  onChamberFilterChange: (value: string) => void;
  chambers: string[];
}

export const CommitteesHeader = ({ 
  filteredCount,
  totalCount,
  chamberFilter, 
  onChamberFilterChange, 
  chambers 
}: CommitteesHeaderProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Committees
        </h1>
        <p className="text-muted-foreground">
          {chamberFilter === "all" 
            ? `${totalCount} committees` 
            : `${filteredCount} of ${totalCount} committees`}
        </p>
      </div>

      <RadioGroup
        value={chamberFilter}
        onValueChange={onChamberFilterChange}
        className="flex flex-wrap gap-4"
      >
        {chambers.map((chamber) => (
          <div key={chamber} className="flex items-center space-x-2">
            <RadioGroupItem value={chamber} id={chamber} />
            <Label htmlFor={chamber}>{chamber}</Label>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all">All</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Sparkles } from "lucide-react";

interface Problem {
  id: string;
  problem_number: string;
  title: string;
  problem_statement: string;
  current_state: string;
  created_at: string;
  updated_at: string;
}

interface ProblemsTableProps {
  problems: Problem[];
}

export const ProblemsTable = ({ problems }: ProblemsTableProps) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'problem identified':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'resolved':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const statusOptions = [
    { value: 'Problem Identified', label: 'Identified' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' }
  ];

  const categoryOptions = [
    { value: 'General', label: 'General' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Environment', label: 'Environment' }
  ];

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {problems.map((problem) => (
          <div key={problem.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{problem.problem_number}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{problem.problem_statement}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <Badge variant={getStatusBadgeVariant(problem.current_state)}>
                {problem.current_state === 'Problem Identified' ? 'Identified' : problem.current_state}
              </Badge>
              <span>{formatDate(problem.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View with Proper Horizontal Scroll Containment */}
      <div className="hidden md:block">
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <Table className="min-w-[800px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Problem Number</TableHead>
                  <TableHead className="min-w-[300px] whitespace-nowrap">Problem Statement</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Category</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Last Action</TableHead>
                  <TableHead className="min-w-[120px] text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((problem) => (
                  <TableRow
                    key={problem.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {problem.problem_number}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={problem.problem_statement}>
                        {problem.problem_statement}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Select defaultValue={problem.current_state}>
                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>
                            <Badge variant={getStatusBadgeVariant(problem.current_state)}>
                              {problem.current_state === 'Problem Identified' ? 'Identified' : problem.current_state}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Select defaultValue="General">
                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>General</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(problem.updated_at)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Add to Favorites"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="AI Analysis"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {problems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No problems found
        </div>
      )}
    </div>
  );
};


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Sparkles } from "lucide-react";

interface Solution {
  id: string;
  title: string;
  draft_content: string;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface SolutionsTableProps {
  solutions: Solution[];
}

export const SolutionsTable = ({ solutions }: SolutionsTableProps) => {
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
      case 'draft':
        return 'default';
      case 'in_review':
        return 'secondary';
      case 'published':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'in_review', label: 'In Review' },
    { value: 'published', label: 'Published' }
  ];

  const typeOptions = [
    { value: 'Legislative Draft', label: 'Legislative Draft' },
    { value: 'Policy Brief', label: 'Policy Brief' },
    { value: 'Amendment', label: 'Amendment' }
  ];

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {solutions.map((solution) => (
          <div key={solution.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{solution.title}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{solution.draft_content}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <Badge variant={getStatusBadgeVariant(solution.status)}>
                {solution.status}
              </Badge>
              <span>{formatDate(solution.updated_at)}</span>
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
                  <TableHead className="min-w-[200px] whitespace-nowrap">Solution Title</TableHead>
                  <TableHead className="min-w-[300px] whitespace-nowrap">Content Preview</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Type</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Last Action</TableHead>
                  <TableHead className="min-w-[120px] text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solutions.map((solution) => (
                  <TableRow
                    key={solution.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {solution.title}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={solution.draft_content}>
                        {solution.draft_content}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Select defaultValue={solution.status}>
                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>
                            <Badge variant={getStatusBadgeVariant(solution.status)}>
                              {solution.status}
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
                      <Select defaultValue={solution.type || "Legislative Draft"}>
                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>{solution.type || "Legislative Draft"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(solution.updated_at)}
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

      {solutions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No solutions found
        </div>
      )}
    </div>
  );
};

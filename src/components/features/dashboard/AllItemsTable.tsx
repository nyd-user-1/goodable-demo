
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Sparkles } from "lucide-react";
import { Bill } from "./types";

interface AllItemsTableProps {
  bills: Bill[];
  problems: any[];
  solutions: any[];
  media: any[];
  onBillSelect?: (bill: Bill) => void;
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  favoriteBillIds: Set<number>;
  billsWithAIChat?: Set<number>;
}

type AllItem = {
  id: string;
  type: 'bill' | 'problem' | 'solution' | 'media';
  title: string;
  description: string;
  status: string;
  category: string;
  lastAction: string;
  data: any;
  workflowPhase: number;
};

export const AllItemsTable = ({
  bills,
  problems,
  solutions,
  media,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  favoriteBillIds,
  billsWithAIChat = new Set()
}: AllItemsTableProps) => {
  
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

  // 4-color workflow phase system
  const getWorkflowPhase = (type: string, status: string): number => {
    switch (type) {
      case 'bill':
        switch (status?.toLowerCase()) {
          case 'introduced': return 1;
          case 'in committee': return 2;
          case 'passed': return 3;
          case 'signed': return 4;
          default: return 1;
        }
      case 'problem':
        switch (status?.toLowerCase()) {
          case 'problem identified': return 1;
          case 'in progress': return 2;
          case 'resolved': return 3;
          case 'closed': return 4;
          default: return 1;
        }
      case 'solution':
        switch (status?.toLowerCase()) {
          case 'draft': return 1;
          case 'in_review': return 2;
          case 'published': return 3;
          case 'implemented': return 4;
          default: return 1;
        }
      case 'media':
        switch (status?.toLowerCase()) {
          case 'draft': return 1;
          case 'in_review': return 2;
          case 'published': return 3;
          case 'distributed': return 4;
          default: return 1;
        }
      default:
        return 1;
    }
  };

  const getWorkflowPhaseColor = (phase: number): string => {
    switch (phase) {
      case 1: return 'bg-red-50 text-red-700 border-red-200';
      case 2: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 3: return 'bg-blue-50 text-blue-700 border-blue-200';
      case 4: return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Combine all items into a single array
  const allItems: AllItem[] = [
    ...bills.slice(0, 5).map(bill => ({
      id: bill.bill_id.toString(),
      type: 'bill' as const,
      title: bill.bill_number || 'No Number',
      description: bill.title || 'No Title',
      status: bill.status_desc || 'Unknown',
      category: bill.committee || 'N/A',
      lastAction: bill.last_action || 'No recent action',
      data: bill,
      workflowPhase: getWorkflowPhase('bill', bill.status_desc || '')
    })),
    ...problems.slice(0, 3).map(problem => ({
      id: problem.id,
      type: 'problem' as const,
      title: problem.problem_number,
      description: problem.problem_statement,
      status: problem.current_state,
      category: 'General',
      lastAction: formatDate(problem.updated_at),
      data: problem,
      workflowPhase: getWorkflowPhase('problem', problem.current_state)
    })),
    ...solutions.slice(0, 3).map(solution => ({
      id: solution.id,
      type: 'solution' as const,
      title: solution.title,
      description: solution.draft_content,
      status: solution.status,
      category: solution.type || 'Legislative Draft',
      lastAction: formatDate(solution.updated_at),
      data: solution,
      workflowPhase: getWorkflowPhase('solution', solution.status)
    })),
    ...media.slice(0, 3).map(mediaItem => ({
      id: mediaItem.id,
      type: 'media' as const,
      title: mediaItem.title,
      description: mediaItem.content,
      status: mediaItem.status,
      category: mediaItem.content_type,
      lastAction: formatDate(mediaItem.updated_at),
      data: mediaItem,
      workflowPhase: getWorkflowPhase('media', mediaItem.status)
    }))
  ].sort((a, b) => {
    // Sort by last action date, most recent first
    if (a.type === 'bill' && b.type === 'bill') {
      const aDate = a.data.last_action_date || a.data.status_date;
      const bDate = b.data.last_action_date || b.data.status_date;
      if (aDate && bDate) {
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      }
      return 0;
    }
    // For non-bills, sort by updated_at
    const aDate = a.data.updated_at;
    const bDate = b.data.updated_at;
    if (aDate && bDate) {
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    return 0;
  });

  const getObjectTypeDisplay = (type: string) => {
    switch (type) {
      case 'bill': return 'Bill';
      case 'problem': return 'Problem';
      case 'solution': return 'Solution';
      case 'media': return 'Media Kit';
      default: return type;
    }
  };

  const handleItemClick = (item: AllItem) => {
    if (item.type === 'bill' && onBillSelect) {
      onBillSelect(item.data);
    }
    // Add navigation logic for other types as needed
  };

  const getStatusOptions = (type: string) => {
    switch (type) {
      case 'bill':
        return [
          { value: 'Introduced', label: 'Introduced' },
          { value: 'In Committee', label: 'In Committee' },
          { value: 'Passed', label: 'Passed' },
          { value: 'Signed', label: 'Signed' }
        ];
      case 'problem':
        return [
          { value: 'Problem Identified', label: 'Identified' },
          { value: 'In Progress', label: 'In Progress' },
          { value: 'Resolved', label: 'Resolved' },
          { value: 'Closed', label: 'Closed' }
        ];
      case 'solution':
        return [
          { value: 'draft', label: 'Draft' },
          { value: 'in_review', label: 'In Review' },
          { value: 'published', label: 'Published' },
          { value: 'implemented', label: 'Implemented' }
        ];
      case 'media':
        return [
          { value: 'draft', label: 'Draft' },
          { value: 'in_review', label: 'In Review' },
          { value: 'published', label: 'Published' },
          { value: 'distributed', label: 'Distributed' }
        ];
      default:
        return [];
    }
  };

  const getCategoryOptions = (type: string) => {
    switch (type) {
      case 'bill':
        return [
          { value: 'Assembly Health', label: 'Assembly Health' },
          { value: 'Assembly Education', label: 'Assembly Education' },
          { value: 'Senate Finance', label: 'Senate Finance' }
        ];
      case 'problem':
        return [
          { value: 'General', label: 'General' },
          { value: 'Healthcare', label: 'Healthcare' },
          { value: 'Education', label: 'Education' }
        ];
      case 'solution':
        return [
          { value: 'Legislative Draft', label: 'Legislative Draft' },
          { value: 'Policy Brief', label: 'Policy Brief' },
          { value: 'Amendment', label: 'Amendment' }
        ];
      case 'media':
        return [
          { value: 'press_release', label: 'Press Release' },
          { value: 'social_media', label: 'Social Media' },
          { value: 'newsletter', label: 'Newsletter' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {allItems.map((item) => (
          <div 
            key={`${item.type}-${item.id}`} 
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{getObjectTypeDisplay(item.type)}</span>
                <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
              </div>
              {item.type === 'bill' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => onFavorite(item.data, e)}
                  >
                    <Heart className={`h-4 w-4 ${favoriteBillIds.has(item.data.bill_id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => onAIAnalysis(item.data, e)}
                  >
                    <Sparkles className={`h-4 w-4 ${billsWithAIChat.has(item.data.bill_id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex gap-2">
                <Badge className={`text-xs ${getWorkflowPhaseColor(item.workflowPhase)}`}>
                  {item.type === 'problem' && item.status === 'Problem Identified' ? 'Identified' : item.status}
                </Badge>
              </div>
              <span>{item.lastAction}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table with Proper Horizontal Scroll Containment */}
      <div className="hidden md:block">
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <Table className="min-w-[800px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Object</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Number</TableHead>
                  <TableHead className="min-w-[300px] whitespace-nowrap">Description</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Category</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Last Action</TableHead>
                  <TableHead className="min-w-[120px] text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allItems.map((item) => (
                  <TableRow
                    key={`${item.type}-${item.id}`}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleItemClick(item)}
                  >
                    <TableCell className="whitespace-nowrap">
                      <span className="text-sm font-medium">{getObjectTypeDisplay(item.type)}</span>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {item.title}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={item.description}>
                        {item.description}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Select defaultValue={item.status}>
                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>
                            <Badge className={getWorkflowPhaseColor(item.workflowPhase)}>
                              {item.type === 'problem' && item.status === 'Problem Identified' ? 'Identified' : item.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusOptions(item.type).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Select defaultValue={item.category}>
                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>{item.category}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {getCategoryOptions(item.type).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {item.lastAction}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {item.type === 'bill' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => onFavorite(item.data, e)}
                              title="Add to Favorites"
                            >
                              <Heart className={`h-4 w-4 ${favoriteBillIds.has(item.data.bill_id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => onAIAnalysis(item.data, e)}
                              title="AI Analysis"
                            >
                              <Sparkles className={`h-4 w-4 ${billsWithAIChat.has(item.data.bill_id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {allItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items found
        </div>
      )}
    </div>
  );
};

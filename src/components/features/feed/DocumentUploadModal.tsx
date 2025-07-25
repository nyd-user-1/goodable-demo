import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  FileText,
  Search,
  Filter,
  Calendar,
  Building2,
  ChevronDown,
  X
} from 'lucide-react';

interface Document {
  id: string;
  billNumber: string;
  type: string;
  period: string;
  date: string;
  title?: string;
}

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onOpenChange
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [tickerFilter, setTickerFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');

  const popularFilters = [
    'Committee Hearings',
    'Floor Transcripts', 
    'Bill Analysis',
    'Fiscal Notes',
    'Legislative Memos',
    'Press Releases'
  ];

  const sampleDocuments: Document[] = [
    {
      id: '1',
      billNumber: 'A.1234',
      type: 'Committee Hearing',
      period: 'Q1 2025',
      date: '01/15/2025',
      title: 'Healthcare Reform Committee Hearing'
    },
    {
      id: '2', 
      billNumber: 'S.5678',
      type: 'Bill Analysis',
      period: 'Q1 2025',
      date: '01/12/2025',
      title: 'Education Funding Analysis'
    },
    {
      id: '3',
      billNumber: 'A.2468',
      type: 'Fiscal Note',
      period: 'FY 2025',
      date: '01/10/2025',
      title: 'Infrastructure Spending Impact'
    },
    {
      id: '4',
      billNumber: 'S.1357',
      type: 'Floor Transcript',
      period: 'Q1 2025', 
      date: '01/08/2025',
      title: 'Senate Floor Debate on Climate Bill'
    },
    {
      id: '5',
      billNumber: 'A.9876',
      type: 'Committee Hearing',
      period: 'Q4 2024',
      date: '12/20/2024',
      title: 'Criminal Justice Reform Hearing'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocumentToggle = (document: Document) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.some(doc => doc.id === document.id);
      if (isSelected) {
        return prev.filter(doc => doc.id !== document.id);
      } else {
        return [...prev, document];
      }
    });
  };

  const handleFilterClick = (filter: string) => {
    setDocTypeFilter(filter);
  };

  const filteredDocuments = sampleDocuments.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTicker = tickerFilter === '' || 
      doc.billNumber.toLowerCase().includes(tickerFilter.toLowerCase());
      
    const matchesDocType = docTypeFilter === '' || 
      doc.type.toLowerCase().includes(docTypeFilter.toLowerCase());

    return matchesSearch && matchesTicker && matchesDocType;
  });

  const handleAddDocuments = () => {
    console.log('Adding documents:', selectedDocuments);
    console.log('Uploading files:', selectedFiles);
    // TODO: Implement document addition logic
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Documents to Research
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="library">Legislative Library</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Upload your documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, Word, PPT, TXT, MD. Files auto-delete in 7 days.
                  </p>
                  <div className="pt-4">
                    <Button asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Select Files
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="library" className="mt-6 overflow-hidden flex flex-col">
            <div className="space-y-4 flex-shrink-0">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by bill number, title, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bills
                  <ChevronDown className="w-3 h-3" />
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Doc Types
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>

              {/* Popular Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Popular:</span>
                {popularFilters.map((filter) => (
                  <Button
                    key={filter}
                    variant={docTypeFilter === filter ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleFilterClick(filter)}
                    className="h-7 text-xs"
                  >
                    {filter}
                  </Button>
                ))}
              </div>

              {/* Selected Documents */}
              {selectedDocuments.length > 0 && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedDocuments.length} documents selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDocuments([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Document List */}
            <ScrollArea className="flex-1 mt-4">
              <div className="space-y-2">
                {filteredDocuments.map((document) => {
                  const isSelected = selectedDocuments.some(doc => doc.id === document.id);
                  return (
                    <div
                      key={document.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleDocumentToggle(document)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by div click
                            className="rounded"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {document.billNumber}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {document.type}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">
                              {document.title || `${document.type} - ${document.billNumber}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {document.period} • {document.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedFiles.length > 0 || selectedDocuments.length > 0
              ? `${selectedFiles.length + selectedDocuments.length} items ready to add`
              : 'Select documents to add to your research'
            }
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddDocuments}
              disabled={selectedFiles.length === 0 && selectedDocuments.length === 0}
            >
              Add to Research
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
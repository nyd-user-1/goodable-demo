import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Document = Tables<"Documents">;

interface BillTextProps {
  billId: number;
}

export const BillText = ({ billId }: BillTextProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [billId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data: documentsData } = await supabase
        .from("Documents")
        .select("*")
        .eq("bill_id", billId)
        .order("document_id");

      setDocuments(documentsData || []);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'introduced':
        return 'bg-blue-100 text-blue-800';
      case 'amended':
        return 'bg-yellow-100 text-yellow-800';
      case 'engrossed':
        return 'bg-green-100 text-green-800';
      case 'enrolled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="card bg-card rounded-xl shadow-sm border overflow-hidden">
      <CardHeader className="card-header px-6 py-4 border-b">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Bill Text & Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="card-body p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              No bill text or related documents have been found for this bill.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'} available
              </p>
            </div>
            
            <div className="grid gap-4">
              {documents.map((document) => (
                <div 
                  key={document.document_id} 
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-sm">
                          {document.document_desc || `Document ${document.document_id}`}
                        </h4>
                        {document.document_type && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getDocumentTypeColor(document.document_type)}`}
                          >
                            {document.document_type}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {document.document_mime && (
                          <span>Type: {document.document_mime}</span>
                        )}
                        {document.document_size && (
                          <span>Size: {formatFileSize(document.document_size)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      {document.url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(document.url!, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      {document.state_link && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(document.state_link!, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          State
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
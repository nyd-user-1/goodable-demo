import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Download, 
  Copy, 
  Check,
  Calendar,
  Ruler,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';

interface ImageAsset {
  id: string;
  unique_id: string;
  name: string;
  original_name: string;
  url: string;
  width?: number;
  height?: number;
  size_bytes?: number;
  uploaded_at: string;
  tags: string[];
}

interface ImagePreviewDialogProps {
  image: ImageAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  image,
  open,
  onOpenChange
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!image) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(image.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Preview - {image.name}</DialogTitle>
        </DialogHeader>
        
        {/* Image Container */}
        <div className="relative bg-black/5 dark:bg-white/5">
          <div className="relative flex items-center justify-center max-h-[60vh] overflow-hidden">
            <img
              src={image.url}
              alt={image.name}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{image.name}</h3>
              <p className="text-sm text-muted-foreground">{image.original_name}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied' : 'Copy URL'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span>Unique ID</span>
              </div>
              <p className="text-sm font-medium">{image.unique_id}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Upload Date</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(image.uploaded_at), 'MM/dd/yyyy')}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Ruler className="h-3 w-3" />
                <span>Dimensions</span>
              </div>
              <p className="text-sm font-medium">
                {image.width && image.height 
                  ? `${image.width} x ${image.height} px`
                  : 'Unknown'
                }
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="h-3 w-3" />
                <span>File Size</span>
              </div>
              <p className="text-sm font-medium">
                {formatFileSize(image.size_bytes)}
              </p>
            </div>
          </div>

          {/* Tags */}
          {image.tags && image.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* URL Display */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Image URL</p>
            <code className="block text-xs bg-muted p-2 rounded overflow-x-auto">
              {image.url}
            </code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
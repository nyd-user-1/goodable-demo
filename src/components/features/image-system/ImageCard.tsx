import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  Image as ImageIcon,
  Calendar,
  Hash,
  Trash2,
  FileImage
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

interface ImageCardProps {
  asset: ImageAsset;
  onClick: () => void;
  onCopyUrl?: (url: string, id: string) => void;
  onDelete?: (assetId: string) => void;
  copiedItem?: string | null;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  asset,
  onClick,
  onCopyUrl,
  onDelete,
  copiedItem
}) => {
  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyUrl?.(asset.url, asset.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      onDelete?.(asset.id);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / 1024 / 1024;
    if (mb < 1) {
      const kb = bytes / 1024;
      return `${kb.toFixed(1)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Image container */}
      <div className="aspect-square w-full overflow-hidden bg-muted/50 relative">
        <img 
          src={asset.url} 
          alt={asset.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.classList.remove('hidden');
              fallback.classList.add('flex');
            }
          }}
        />
        {/* Fallback when image fails to load */}
        <div className="hidden absolute inset-0 flex-col items-center justify-center text-muted-foreground bg-muted/50">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-xs text-center px-2">{asset.name}</span>
        </div>
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyClick}
            className="bg-white/90 hover:bg-white text-black"
          >
            {copiedItem === asset.id ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copiedItem === asset.id ? 'Copied!' : 'Copy URL'}
          </Button>
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              className="bg-red-500/90 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 flex flex-col h-full">
        {/* Header with ID and date */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Hash className="w-3 h-3" />
            <span className="font-mono">{asset.unique_id}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(asset.uploaded_at), 'MM/dd/yyyy')}</span>
          </div>
        </div>

        {/* Filename */}
        <h5 className="font-medium text-sm truncate mb-2" title={asset.original_name}>
          {asset.original_name}
        </h5>

        {/* File info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <FileImage className="w-3 h-3" />
            <span>{formatFileSize(asset.size_bytes)}</span>
          </div>
          {asset.width && asset.height && (
            <span>{asset.width} × {asset.height} px</span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {asset.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* URL preview - pushed to bottom */}
        <div className="border-t pt-2 mt-auto">
          <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
            {asset.url}
          </code>
        </div>
      </div>
    </Card>
  );
};
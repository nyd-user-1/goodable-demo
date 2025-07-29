import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  Image as ImageIcon,
  Calendar,
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
  uploaded_at: string;
  tags: string[];
}

interface ImageCardProps {
  asset: ImageAsset;
  onClick: () => void;
  onCopyUrl?: (url: string, id: string) => void;
  copiedItem?: string | null;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  asset,
  onClick,
  onCopyUrl,
  copiedItem
}) => {
  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyUrl?.(asset.url, asset.id);
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
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
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
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 space-y-3">
        {/* Header with ID and date */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{asset.unique_id}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(asset.uploaded_at), 'MM/dd/yyyy')}</span>
              </div>
            </div>
            <h5 className="font-medium text-sm truncate" title={asset.original_name}>
              {asset.original_name}
            </h5>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {asset.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Dimensions (if available) */}
        {asset.width && asset.height && (
          <div className="text-xs text-muted-foreground">
            {asset.width} × {asset.height} px
          </div>
        )}

        {/* URL preview */}
        <div className="border-t pt-2">
          <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
            {asset.url}
          </code>
        </div>
      </div>
    </Card>
  );
};
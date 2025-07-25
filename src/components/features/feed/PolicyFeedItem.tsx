import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Share2, 
  ThumbsDown, 
  ExternalLink, 
  Clock,
  User,
  Building2,
  TrendingUp
} from 'lucide-react';

interface FeedItem {
  id: string;
  billNumber: string;
  title: string;
  sponsor: string;
  status: string;
  categories: string[];
  summaryPoints: string[];
  lastAction: string;
  timestamp: string;
  type: 'bill' | 'committee' | 'news' | 'analysis';
}

interface PolicyFeedItemProps {
  item: FeedItem;
}

export const PolicyFeedItem: React.FC<PolicyFeedItemProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  const getTypeIcon = () => {
    switch (item.type) {
      case 'bill':
        return <FileText className="w-4 h-4" />;
      case 'committee':
        return <Building2 className="w-4 h-4" />;
      case 'analysis':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'bill':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'committee':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'analysis':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusVariant = () => {
    const status = item.status.toLowerCase();
    if (status.includes('passed')) return 'default';
    if (status.includes('committee')) return 'secondary';
    if (status.includes('review')) return 'outline';
    return 'secondary';
  };

  const handleTranscriptClick = () => {
    console.log('Opening transcript for:', item.billNumber);
    // TODO: Implement transcript modal or navigation
  };

  const handleShareClick = () => {
    console.log('Sharing item:', item.id);
    // TODO: Implement sharing functionality
  };

  const handleNotHelpfulClick = () => {
    setIsHelpful(false);
    console.log('Marked as not helpful:', item.id);
    // TODO: Implement feedback collection
  };

  const handleBillClick = () => {
    console.log('Navigating to bill:', item.billNumber);
    // TODO: Navigate to bill detail page
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${getTypeColor()}`}>
              {getTypeIcon()}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                  onClick={handleBillClick}
                >
                  {item.billNumber}
                </Button>
                <Badge variant={getStatusVariant()} className="text-xs">
                  {item.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{item.sponsor}</span>
                <Separator orientation="vertical" className="h-3" />
                <Clock className="w-3 h-3" />
                <span>{item.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1">
            {item.categories.slice(0, 3).map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {item.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.categories.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-4 leading-tight">
          {item.title}
        </h3>

        {/* Summary Points */}
        <div className="space-y-3 mb-6">
          {item.summaryPoints.slice(0, isExpanded ? undefined : 2).map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {point}
              </p>
            </div>
          ))}
          
          {item.summaryPoints.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary/80 h-auto p-0 font-medium"
            >
              {isExpanded ? 'Show less' : `Show ${item.summaryPoints.length - 2} more points`}
            </Button>
          )}
        </div>

        {/* Last Action */}
        <div className="mb-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">Last Action:</span>
            <span className="text-muted-foreground">{item.lastAction}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTranscriptClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <FileText className="w-4 h-4 mr-2" />
              {item.type === 'bill' ? 'Full Text' : 'Transcript'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotHelpfulClick}
              className={`text-muted-foreground hover:text-destructive ${
                isHelpful === false ? 'text-destructive' : ''
              }`}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Not helpful
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBillClick}
            className="text-primary border-primary/20 hover:bg-primary/5"
          >
            View Details
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </div>

        {/* Feedback Message */}
        {isHelpful === false && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              Thank you for your feedback. We'll work to improve content relevance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
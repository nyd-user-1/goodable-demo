import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Shield, AlertTriangle } from "lucide-react";
import { getSourceCredibilityBadge, validateSourceMix, extractDomain } from '@/config/domainFilters';

interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  type?: string;
  credibility?: {
    tier: number;
    category: string;
    icon?: string;
  };
}

interface CitationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  citations: Citation[];
}

export const CitationsDrawer = ({ open, onOpenChange, citations }: CitationsDrawerProps) => {
  // Validate source mix
  const sourceUrls = citations.map(c => c.url).filter(Boolean);
  const validation = validateSourceMix(sourceUrls);
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              Citations & Sources
              {validation.valid ? (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Needs Review
                </Badge>
              )}
            </DrawerTitle>
            <DrawerDescription>
              {citations.length} sources • Diversity score: {validation.diversityScore}
              {validation.goodablePercentage > 0 && (
                <span className="ml-2">• NYSgpt: {Math.round(validation.goodablePercentage)}%</span>
              )}
            </DrawerDescription>
            {validation.warnings.length > 0 && (
              <div className="text-xs text-orange-600 mt-2 space-y-1">
                {validation.warnings.map((warning, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </DrawerHeader>
          <div className="p-4 pb-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {citations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No citations available for this response.
                </p>
              ) : (
                citations.map((citation) => {
                  const domain = extractDomain(citation.url);
                  const credibilityBadge = getSourceCredibilityBadge(domain);
                  
                  return (
                    <div key={citation.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-sm leading-tight">{citation.title}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                credibilityBadge.color === 'green' ? 'text-green-600 border-green-200' :
                                credibilityBadge.color === 'blue' ? 'text-blue-600 border-blue-200' :
                                credibilityBadge.color === 'orange' ? 'text-orange-600 border-orange-200' :
                                'text-gray-600 border-gray-200'
                              }`}
                            >
                              {credibilityBadge.icon && <span className="mr-1">{credibilityBadge.icon}</span>}
                              {credibilityBadge.label}
                            </Badge>
                            {citation.type && (
                              <Badge variant="secondary" className="text-xs">
                                {citation.type}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{domain}</span>
                          </div>
                        </div>
                        {citation.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(citation.url, '_blank')}
                            className="h-8 w-8 p-0 shrink-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{citation.excerpt}</p>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Source Quality Summary */}
            {citations.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Source Quality Summary:</p>
                  <p>• {citations.filter(c => getSourceCredibilityBadge(extractDomain(c.url)).tier === 1).length} Tier 1 (Authoritative)</p>
                  <p>• {citations.filter(c => getSourceCredibilityBadge(extractDomain(c.url)).tier === 2).length} Tier 2 (Reliable)</p>
                  <p>• {citations.filter(c => getSourceCredibilityBadge(extractDomain(c.url)).tier === 3).length} Tier 3+ (Standard)</p>
                  {validation.valid && (
                    <p className="text-green-600 font-medium mt-2">✓ Meets NYSgpt quality standards</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
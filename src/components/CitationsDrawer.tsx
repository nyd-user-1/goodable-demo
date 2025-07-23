
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt: string;
}

interface CitationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  citations: Citation[];
}

export const CitationsDrawer = ({ open, onOpenChange, citations }: CitationsDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Citations & Sources</DrawerTitle>
            <DrawerDescription>
              Sources referenced in this analysis
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {citations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No citations available for this response.
                </p>
              ) : (
                citations.map((citation) => (
                  <div key={citation.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{citation.title}</h4>
                      {citation.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(citation.url, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm">{citation.excerpt}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

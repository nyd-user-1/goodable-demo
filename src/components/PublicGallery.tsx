import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LegislativeDraft } from "@/types/legislation";
import { Eye, Calendar, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublicGalleryProps {
  onDraftSelect: (draft: LegislativeDraft) => void;
}

export const PublicGallery = ({ onDraftSelect }: PublicGalleryProps) => {
  const [publicDrafts, setPublicDrafts] = useState<LegislativeDraft[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadPublicDrafts();
    loadUserVotes();
  }, []);

  const loadPublicDrafts = () => {
    const allDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    const publicDrafts = allDrafts.filter((draft: LegislativeDraft) => draft.isPublic);
    setPublicDrafts(publicDrafts);
  };

  const loadUserVotes = () => {
    const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    setUserVotes(votes);
  };

  const vote = (draftId: string, rating: number) => {
    // Update user's vote record
    const previousRating = userVotes[draftId];
    const newUserVotes = { ...userVotes, [draftId]: rating };
    setUserVotes(newUserVotes);
    localStorage.setItem('userVotes', JSON.stringify(newUserVotes));

    // Update draft votes
    const allDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    const updatedDrafts = allDrafts.map((draft: LegislativeDraft) => {
      if (draft.id === draftId) {
        const updatedVotes = { ...draft.votes };
        
        // Remove previous vote if exists
        if (previousRating) {
          updatedVotes.starCounts[previousRating - 1]--;
          updatedVotes.totalVotes--;
        }
        
        // Add new vote
        updatedVotes.starCounts[rating - 1]++;
        updatedVotes.totalVotes++;
        
        // Calculate new average rating
        const totalRating = updatedVotes.starCounts.reduce((sum, count, index) => 
          sum + (count * (index + 1)), 0
        );
        updatedVotes.rating = updatedVotes.totalVotes > 0 ? totalRating / updatedVotes.totalVotes : 0;
        
        return { ...draft, votes: updatedVotes };
      }
      return draft;
    });

    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));
    setPublicDrafts(updatedDrafts.filter((draft: LegislativeDraft) => draft.isPublic));

    toast({
      title: "Rating recorded",
      description: `Your ${rating}-star rating has been recorded.`,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const extractBillTitle = (draft: LegislativeDraft) => {
    // Use the stored title directly instead of parsing draft content
    return draft.title || "Untitled Draft";
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technology': return 'bg-blue-100 text-blue-800';
      case 'environment': return 'bg-green-100 text-green-800';
      case 'tax': return 'bg-yellow-100 text-yellow-800';
      case 'social services': return 'bg-purple-100 text-purple-800';
      case 'labor': return 'bg-orange-100 text-orange-800';
      case 'human rights': return 'bg-red-100 text-red-800';
      case 'digital rights': return 'bg-cyan-100 text-cyan-800';
      case 'education': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${onStarClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => onStarClick?.(star)}
          />
        ))}
      </div>
    );
  };

  if (publicDrafts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Public Legislation Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            When legislation is saved and made public, it will appear here for community review and voting.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gallery</h2>
          <p className="text-muted-foreground">Vote for your favorite ideas</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {publicDrafts.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicDrafts.map((draft) => {
          const userRating = userVotes[draft.id] || 0;
          
          return (
            <Card key={draft.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-medium line-clamp-2 flex-1">
                    {extractBillTitle(draft)}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDraftSelect(draft)}
                    className="ml-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getTypeColor(draft.type)}`}>
                    {draft.type}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(draft.createdAt)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {draft.originalIdea && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {draft.originalIdea}
                  </p>
                )}

                {/* Rating Display */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(draft.votes.rating))}
                      <span className="text-sm font-medium">
                        {draft.votes.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {draft.votes.totalVotes} {draft.votes.totalVotes === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>

                  {/* User Voting */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Rate this idea:</div>
                    <div className="flex items-center gap-1">
                      {renderStars(userRating, (star) => vote(draft.id, star))}
                      {userRating > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          You rated {userRating} star{userRating !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
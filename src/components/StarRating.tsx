import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useProblemVoting } from '@/hooks/useProblemVoting';

interface StarRatingProps {
  problemId: string;
  className?: string;
  showVoteCount?: boolean;
  showStars?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  problemId, 
  className = "",
  showVoteCount = true,
  showStars = true
}) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { voteStats, userRating, isLoading, submitVote } = useProblemVoting(problemId);

  const handleStarClick = async (selectedRating: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on problems.",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    const result = await submitVote(selectedRating);
    
    if (result.success) {
      toast({
        title: "Vote Submitted",
        description: `You rated this problem ${selectedRating} star${selectedRating !== 1 ? 's' : ''}.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayRating = hoveredRating || userRating || voteStats.average_rating;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between w-full">
        {showStars && (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6 hover:bg-transparent"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={isLoading}
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    star <= displayRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground hover:text-yellow-300'
                  } ${isLoading ? 'opacity-50' : ''}`}
                />
              </Button>
            ))}
          </div>
        )}
        
        {showVoteCount && (
          <div className="text-xs text-muted-foreground text-right">
            {voteStats.total_votes > 0 ? (
              <div className="flex flex-col items-end">
                <div className="font-medium">
                  {voteStats.average_rating.toFixed(1)} stars
                </div>
                <div>
                  {voteStats.total_votes} vote{voteStats.total_votes !== 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <div>No votes yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Export a component that only shows vote statistics
export const VoteStats: React.FC<{ problemId: string; className?: string }> = ({ 
  problemId, 
  className = "" 
}) => {
  const { voteStats } = useProblemVoting(problemId);
  
  if (voteStats.total_votes === 0) {
    return null;
  }

  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      {voteStats.average_rating.toFixed(1)} stars • {voteStats.total_votes} vote{voteStats.total_votes !== 1 ? 's' : ''}
    </div>
  );
};
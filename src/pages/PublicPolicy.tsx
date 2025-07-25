import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Send,
  FileText,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BlogProposal {
  id: string;
  title: string;
  content: string;
  summary: string;
  author_id: string;
  status: string;
  category: string;
  tags: string[];
  published_at: string;
  view_count: number;
  is_featured: boolean;
  author_name?: string;
  author_avatar?: string;
  up_votes?: number;
  down_votes?: number;
  comment_count?: number;
  total_score?: number;
}

interface BlogComment {
  id: string;
  proposal_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

const PublicPolicy = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogProposal[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogProposal | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userVotes, setUserVotes] = useState<{[key: string]: 'upvote' | 'downvote' | null}>({});
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  // Load published proposals
  useEffect(() => {
    loadProposals();
    if (user) {
      loadUserVotes();
    }
  }, [user]);

  const loadProposals = async () => {
    try {
      // First try the view, if it doesn't exist, fall back to the table
      let { data, error } = await (supabase as any)
        .from('blog_proposal_stats')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      // If the view doesn't exist, use the main table
      if (error && error.code === '42P01') {
        console.log('View not found, using blog_proposals table directly');
        const result = await (supabase as any)
          .from('blog_proposals')
          .select(`
            *,
            profiles!blog_proposals_author_id_fkey (
              display_name,
              username,
              avatar_url
            )
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        
        data = result.data;
        error = result.error;
        
        // Transform the data to match expected format
        if (data) {
          data = data.map((post: any) => ({
            ...post,
            author_name: post.profiles?.display_name || post.profiles?.username || 'Unknown Author',
            author_avatar: post.profiles?.avatar_url,
            up_votes: 0,
            down_votes: 0,
            comment_count: 0,
            total_score: 0
          }));
        }
      }

      if (error) {
        console.error('Final error loading proposals:', error);
        throw error;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error loading proposals:', error);
      // Don't show error toast on initial load to avoid alarming users
      // The page will still render with "No policies published yet" message
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('blog_votes')
        .select('proposal_id, vote_type')
        .eq('voter_id', user.id);

      if (error) throw error;

      const votesMap: {[key: string]: 'upvote' | 'downvote' | null} = {};
      data?.forEach((vote: any) => {
        votesMap[vote.proposal_id] = vote.vote_type;
      });
      setUserVotes(votesMap);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const loadComments = async (proposalId: string) => {
    setLoadingComments(true);
    try {
      // First try the view, if it doesn't exist, fall back to the table
      let { data, error } = await (supabase as any)
        .from('blog_comments_with_authors')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      // If the view doesn't exist, use the main table with join
      if (error && error.code === '42P01') {
        console.log('View not found, using blog_comments table directly');
        const result = await (supabase as any)
          .from('blog_comments')
          .select(`
            *,
            profiles!blog_comments_author_id_fkey (
              display_name,
              username,
              avatar_url
            )
          `)
          .eq('proposal_id', proposalId)
          .order('created_at', { ascending: true });
        
        data = result.data;
        error = result.error;
        
        // Transform the data to match expected format
        if (data) {
          data = data.map((comment: any) => ({
            ...comment,
            author_name: comment.profiles?.display_name || comment.profiles?.username || 'Unknown',
            author_avatar: comment.profiles?.avatar_url
          }));
        }
      }

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleVote = async (proposalId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote.",
        variant: "destructive"
      });
      return;
    }

    const currentVote = userVotes[proposalId];
    
    try {
      if (currentVote === voteType) {
        // Remove vote
        await (supabase as any)
          .from('blog_votes')
          .delete()
          .eq('proposal_id', proposalId)
          .eq('voter_id', user.id);
        
        setUserVotes(prev => ({ ...prev, [proposalId]: null }));
      } else {
        // Upsert vote
        await (supabase as any)
          .from('blog_votes')
          .upsert({
            proposal_id: proposalId,
            voter_id: user.id,
            vote_type: voteType
          });
        
        setUserVotes(prev => ({ ...prev, [proposalId]: voteType }));
      }

      // Refresh proposals to get updated counts
      await loadProposals();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Vote Failed",
        description: "There was an error recording your vote.",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async (proposalId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment.",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      await (supabase as any)
        .from('blog_comments')
        .insert({
          proposal_id: proposalId,
          author_id: user.id,
          content: newComment
        });

      setNewComment('');
      
      // Reload comments
      await loadComments(proposalId);
      
      // Update comment count in the main list
      await loadProposals();
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Comment Failed",
        description: "There was an error posting your comment.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVoteColor = (proposalId: string, voteType: 'upvote' | 'downvote') => {
    const userVote = userVotes[proposalId];
    if (userVote === voteType) {
      return voteType === 'upvote' ? 'text-green-600' : 'text-red-600';
    }
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <Button variant="outline" onClick={() => {
              setSelectedPost(null);
              setComments([]);
            }}>
              ← Back to All Policies
            </Button>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedPost.category}
                  </Badge>
                  {selectedPost.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-3xl font-bold">{selectedPost.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={selectedPost.author_avatar} />
                      <AvatarFallback>{selectedPost.author_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span>{selectedPost.author_name || 'Unknown Author'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedPost.published_at)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(selectedPost.id, 'upvote')}
                      className={getVoteColor(selectedPost.id, 'upvote')}
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      {selectedPost.up_votes || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(selectedPost.id, 'downvote')}
                      className={getVoteColor(selectedPost.id, 'downvote')}
                    >
                      <ArrowDown className="w-4 h-4 mr-1" />
                      {selectedPost.down_votes || 0}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Score: {selectedPost.total_score || 0}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ 
                  __html: selectedPost.content.replace(/\n/g, '<br>').replace(/# /g, '<h1>').replace(/<h1>(.*?)<br>/g, '<h1>$1</h1>') 
                }} />
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Discussion ({comments.length})
                </h3>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Share your thoughts on this policy proposal..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={() => handleAddComment(selectedPost.id)}
                    disabled={!newComment.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>

                <Separator />

                {loadingComments ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.author_avatar} />
                          <AvatarFallback>{comment.author_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.author_name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {comments.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[#3D63DD] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Public Policy Solutions</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Community-driven policy proposals from collaborative problem-solving sessions. 
              Vote and discuss the future of governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-[#3D63DD]" />
                <span className="text-2xl font-bold">{posts.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Published Proposals</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">{posts.reduce((sum, post) => sum + (post.comment_count || 0), 0)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Community Comments</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold">{posts.reduce((sum, post) => sum + (post.up_votes || 0) + (post.down_votes || 0), 0)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Votes Cast</p>
            </Card>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No policies published yet</h3>
                <p className="text-muted-foreground">
                  Policy proposals will appear here when published from problem-solving sessions.
                </p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card 
                  key={post.id} 
                  className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => {
                    setSelectedPost(post);
                    loadComments(post.id);
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {post.category}
                          </Badge>
                          {post.tags?.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <h2 className="text-xl font-semibold mb-2 hover:text-[#3D63DD] transition-colors">
                          {post.title}
                        </h2>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={post.author_avatar} />
                              <AvatarFallback>{post.author_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span>{post.author_name || 'Unknown Author'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.published_at)}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {post.summary || post.content.substring(0, 200) + '...'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post.id, 'upvote');
                          }}
                          className={getVoteColor(post.id, 'upvote')}
                        >
                          <ArrowUp className="w-4 h-4 mr-1" />
                          {post.up_votes || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post.id, 'downvote');
                          }}
                          className={getVoteColor(post.id, 'downvote')}
                        >
                          <ArrowDown className="w-4 h-4 mr-1" />
                          {post.down_votes || 0}
                        </Button>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          {post.comment_count || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPolicy;
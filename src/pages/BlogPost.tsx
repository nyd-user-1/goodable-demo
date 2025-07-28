import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye,
  Calendar,
  User
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  published_at: string;
  author_name: string;
  author_avatar?: string;
  view_count: number;
  up_votes: number;
  down_votes: number;
  comment_count: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar?: string;
}

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      incrementViewCount();
      if (user) {
        fetchUserVote();
      }
    }
  }, [id, user]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('blog_proposal_stats')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch blog post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          id,
          content,
          created_at,
          profiles!inner(display_name, username, avatar_url)
        `)
        .eq('proposal_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedComments = data?.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author_name: comment.profiles.display_name || comment.profiles.username || 'Anonymous',
        author_avatar: comment.profiles.avatar_url
      })) || [];

      setComments(formattedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchUserVote = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_votes')
        .select('vote_type')
        .eq('proposal_id', id)
        .eq('voter_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setUserVote(data?.vote_type || null);
    } catch (err) {
      console.error('Error fetching user vote:', err);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_blog_view_count', { proposal_id: id });
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from('blog_votes')
          .delete()
          .eq('proposal_id', id)
          .eq('voter_id', user.id);
        setUserVote(null);
      } else {
        // Add or update vote
        await supabase
          .from('blog_votes')
          .upsert({
            proposal_id: id,
            voter_id: user.id,
            vote_type: voteType
          });
        setUserVote(voteType);
      }

      // Refresh post data to get updated vote counts
      fetchPost();
    } catch (err) {
      console.error('Error voting:', err);
      toast({
        title: "Vote Failed",
        description: "There was an error recording your vote.",
        variant: "destructive"
      });
    }
  };

  const handleComment = async () => {
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
      setSubmittingComment(true);
      
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          proposal_id: id,
          author_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      fetchPost(); // Refresh to get updated comment count
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully."
      });
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: "Comment Failed",
        description: "There was an error posting your comment.",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-6 lg:py-10">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container max-w-4xl py-6 lg:py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {error ? 'Error Loading Post' : 'Post Not Found'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {error || 'The blog post you are looking for does not exist.'}
          </p>
          <Button onClick={() => navigate('/blog')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      {/* Back button */}
      <Button 
        onClick={() => navigate('/blog')} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Blog
      </Button>

      {/* Post header */}
      <header className="space-y-6 mb-8">
        <div className="space-y-2">
          {post.category && (
            <Badge variant="secondary">{post.category}</Badge>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            {post.title}
          </h1>
          {post.summary && (
            <p className="text-xl text-muted-foreground">
              {post.summary}
            </p>
          )}
        </div>

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span>{post.author_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.published_at}>
              {formatDate(post.published_at)}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.view_count} views</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
      </header>

      <Separator className="mb-8" />

      {/* Post content */}
      <article className="prose prose-lg max-w-none dark:prose-invert mb-8">
        <div dangerouslySetInnerHTML={{ 
          __html: post.content.replace(/\n/g, '<br>') 
        }} />
      </article>

      <Separator className="mb-8" />

      {/* Voting and stats */}
      <div className="flex items-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant={userVote === 'upvote' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleVote('upvote')}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            {post.up_votes}
          </Button>
          <Button
            variant={userVote === 'downvote' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => handleVote('downvote')}
          >
            <ThumbsDown className="w-4 h-4 mr-1" />
            {post.down_votes}
          </Button>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count} comments</span>
        </div>
      </div>

      {/* Comments section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Discussion</h3>
        
        {/* Add comment */}
        {user ? (
          <div className="space-y-4 mb-8">
            <Textarea
              placeholder="Share your thoughts on this post..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleComment} 
              disabled={!newComment.trim() || submittingComment}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Please sign in to join the discussion.</p>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {comment.author_avatar ? (
                <img
                  src={comment.author_avatar}
                  alt={comment.author_name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{comment.author_name}</span>
                  <time className="text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </time>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
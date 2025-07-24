import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Calendar,
  User,
  ArrowUp,
  ArrowDown,
  Send,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  category: string;
  problem: string;
  status: string;
  votes: {
    up: number;
    down: number;
    total: number;
  };
  comments: Comment[];
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

const PublicPolicy = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [userVotes, setUserVotes] = useState<{[key: string]: 'up' | 'down' | null}>({});

  // Load published policies from localStorage
  useEffect(() => {
    const publishedPosts = JSON.parse(localStorage.getItem('publishedPolicies') || '[]');
    setPosts(publishedPosts);
    
    // Load user votes
    const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    setUserVotes(votes);
  }, []);

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    const currentVote = userVotes[postId];
    let newVote: 'up' | 'down' | null = voteType;
    
    // If clicking the same vote, remove it
    if (currentVote === voteType) {
      newVote = null;
    }
    
    // Update posts with new vote counts
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        let upChange = 0;
        let downChange = 0;
        
        // Remove previous vote
        if (currentVote === 'up') upChange -= 1;
        if (currentVote === 'down') downChange -= 1;
        
        // Add new vote
        if (newVote === 'up') upChange += 1;
        if (newVote === 'down') downChange += 1;
        
        const newUpVotes = post.votes.up + upChange;
        const newDownVotes = post.votes.down + downChange;
        
        return {
          ...post,
          votes: {
            up: newUpVotes,
            down: newDownVotes,
            total: newUpVotes - newDownVotes
          }
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    localStorage.setItem('publishedPolicies', JSON.stringify(updatedPosts));
    
    // Update user votes
    const newUserVotes = { ...userVotes, [postId]: newVote };
    setUserVotes(newUserVotes);
    localStorage.setItem('userVotes', JSON.stringify(newUserVotes));
    
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(updatedPosts.find(p => p.id === postId) || null);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        role: 'Member'
      },
      content: newComment,
      timestamp: 'Just now',
      likes: 0
    };
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    localStorage.setItem('publishedPolicies', JSON.stringify(updatedPosts));
    setNewComment('');
    
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(updatedPosts.find(p => p.id === postId) || null);
    }
    
    toast({
      title: "Comment Added",
      description: "Your comment has been posted successfully.",
    });
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

  const getVoteColor = (postId: string, voteType: 'up' | 'down') => {
    const userVote = userVotes[postId];
    if (userVote === voteType) {
      return voteType === 'up' ? 'text-green-600' : 'text-red-600';
    }
    return 'text-muted-foreground';
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Back Button */}
            <Button variant="outline" onClick={() => setSelectedPost(null)}>
              ← Back to All Policies
            </Button>

            {/* Post Header */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedPost.category}
                  </Badge>
                  <Badge variant="outline">
                    Related to: {selectedPost.problem}
                  </Badge>
                </div>
                
                <h1 className="text-3xl font-bold">{selectedPost.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={selectedPost.author.avatar} />
                      <AvatarFallback>{selectedPost.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{selectedPost.author.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedPost.author.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedPost.publishedAt)}
                  </div>
                </div>

                {/* Voting */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(selectedPost.id, 'up')}
                      className={getVoteColor(selectedPost.id, 'up')}
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      {selectedPost.votes.up}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(selectedPost.id, 'down')}
                      className={getVoteColor(selectedPost.id, 'down')}
                    >
                      <ArrowDown className="w-4 h-4 mr-1" />
                      {selectedPost.votes.down}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Score: {selectedPost.votes.total}
                  </div>
                </div>
              </div>
            </Card>

            {/* Post Content */}
            <Card className="p-6">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ 
                  __html: selectedPost.content.replace(/\n/g, '<br>').replace(/# /g, '<h1>').replace(/<h1>(.*?)<br>/g, '<h1>$1</h1>') 
                }} />
              </div>
            </Card>

            {/* Comments Section */}
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Discussion ({selectedPost.comments.length})
                </h3>

                {/* Add Comment */}
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

                {/* Comments List */}
                <div className="space-y-4">
                  {selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.author.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.author.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {selectedPost.comments.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                </div>
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
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[#3D63DD] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Public Policy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Community-driven policy proposals from collaborative problem-solving sessions. 
              Vote and discuss the future of governance.
            </p>
          </div>

          {/* Stats */}
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
                <span className="text-2xl font-bold">{posts.reduce((sum, post) => sum + post.comments.length, 0)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Community Comments</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold">{posts.reduce((sum, post) => sum + post.votes.up + post.votes.down, 0)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Votes Cast</p>
            </Card>
          </div>

          {/* Posts List */}
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
                <Card key={post.id} className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {post.category}
                          </Badge>
                          <Badge variant="outline">
                            {post.problem}
                          </Badge>
                        </div>
                        
                        <h2 
                          className="text-xl font-semibold mb-2 hover:text-[#3D63DD] cursor-pointer"
                          onClick={() => setSelectedPost(post)}
                        >
                          {post.title}
                        </h2>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.publishedAt)}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {post.content.substring(0, 200)}...
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
                            handleVote(post.id, 'up');
                          }}
                          className={getVoteColor(post.id, 'up')}
                        >
                          <ArrowUp className="w-4 h-4 mr-1" />
                          {post.votes.up}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post.id, 'down');
                          }}
                          className={getVoteColor(post.id, 'down')}
                        >
                          <ArrowDown className="w-4 h-4 mr-1" />
                          {post.votes.down}
                        </Button>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments.length}
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPost(post)}
                      >
                        Read More
                      </Button>
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
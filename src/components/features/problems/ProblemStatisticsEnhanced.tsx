import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  MoreHorizontal,
  Heart,
  Reply
} from 'lucide-react';
import { Problem } from '@/data/problems';

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
  replies: Comment[];
  isLiked: boolean;
}

interface ProblemStatisticsEnhancedProps {
  problem: Problem;
}

export const ProblemStatisticsEnhanced = ({ problem }: ProblemStatisticsEnhancedProps) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        name: 'Dr. Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        role: 'Policy Analyst'
      },
      content: 'The data shows a significant correlation between housing costs and policy engagement. We should consider this when evaluating solutions.',
      timestamp: '2 hours ago',
      likes: 12,
      replies: [],
      isLiked: false
    },
    {
      id: '2', 
      author: {
        name: 'Michael Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        role: 'Legislative Aide'
      },
      content: 'Has anyone analyzed the regional differences? The statistics might vary significantly between urban and rural areas.',
      timestamp: '4 hours ago',
      likes: 8,
      replies: [
        {
          id: '2a',
          author: {
            name: 'Emily Watson',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
            role: 'Data Researcher'
          },
          content: 'Good point! I have some rural data that could be relevant. Will share it shortly.',
          timestamp: '3 hours ago', 
          likes: 4,
          replies: [],
          isLiked: true
        }
      ],
      isLiked: true
    }
  ]);

  const statisticsData = [
    {
      label: 'Public Interest',
      value: 78,
      trend: '+12%',
      description: 'Citizens actively engaged with this issue'
    },
    {
      label: 'Policy Impact',
      value: 65,
      trend: '+8%', 
      description: 'Potential for legislative change'
    },
    {
      label: 'Feasibility Score',
      value: 82,
      trend: '+5%',
      description: 'Implementation difficulty assessment'
    },
    {
      label: 'Expert Consensus',
      value: 71,
      trend: '+15%',
      description: 'Agreement among subject matter experts'
    }
  ];

  const handleCommentSubmit = () => {
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
      likes: 0,
      replies: [],
      isLiked: false
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const toggleLike = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statisticsData.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-[#3D63DD]">
                {stat.value}%
              </div>
              <div className="text-xs text-green-600 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.trend}
              </div>
            </div>
            <h3 className="text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#3D63DD]" />
          <h3 className="text-lg font-semibold">Engagement Analytics</h3>
        </div>
        
        {/* Simplified Chart Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Views</span>
            <span className="text-sm text-muted-foreground">2,847</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-[#3D63DD] h-2 rounded-full" style={{ width: '78%' }}></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Expert Contributions</span>
            <span className="text-sm text-muted-foreground">156</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Policy References</span>
            <span className="text-sm text-muted-foreground">89</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </Card>

      {/* Comments Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-[#3D63DD]" />
          <h3 className="text-lg font-semibold">Discussion</h3>
          <Badge variant="secondary" className="ml-auto">
            {comments.length} comments
          </Badge>
        </div>

        {/* Add Comment */}
        <div className="mb-6">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Share your insights on this data..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                size="sm"
                className="ml-auto"
              >
                <Send className="w-4 h-4 mr-2" />
                Comment
              </Button>
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <div className="flex gap-3">
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
                  <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(comment.id)}
                      className={`h-auto p-1 ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground">
                      <Reply className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>

              {/* Nested Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-11 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={reply.author.avatar} />
                        <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{reply.author.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {reply.author.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{reply.content}</p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-auto p-1 text-xs ${reply.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                          >
                            <Heart className={`w-3 h-3 mr-1 ${reply.isLiked ? 'fill-current' : ''}`} />
                            {reply.likes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
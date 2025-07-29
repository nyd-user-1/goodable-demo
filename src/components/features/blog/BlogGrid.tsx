import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Blog image assets from our asset library
const blogImages = [
  '/goodable-botanical.avif',
  '/goodable-heart.avif', 
  '/goodable-night.avif',
  '/goodable-path.avif',
  '/goodable-dandelion.avif',
  '/goodable-dream-state.avif',
  '/goodable-mtn-1.avif',
  '/goodable-path-2.avif',
  '/goodable%2015.avif',
  '/goodable%204.avif'
];

// Function to get a consistent image for each post
const getPostImage = (postId: string, index: number) => {
  return blogImages[index % blogImages.length];
};

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
  is_featured: boolean;
}

interface BlogGridProps {
  posts: BlogPost[];
}

export const BlogGrid = ({ posts }: BlogGridProps) => {
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  const handleVote = (e: React.MouseEvent, postId: string, voteType: 'up' | 'down') => {
    e.preventDefault();
    e.stopPropagation();
    setUserVotes(prev => ({
      ...prev,
      [postId]: prev[postId] === voteType ? null : voteType
    }));
  };

  const getVoteColor = (postId: string, voteType: 'up' | 'down') => {
    if (userVotes[postId] === voteType) {
      return voteType === 'up' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700';
    }
    return 'text-muted-foreground hover:text-foreground';
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <Card key={post.id} className="flex h-full flex-col gap-0 pt-0 group hover:shadow-md transition-shadow relative">
          <CardHeader className="overflow-hidden p-0">
            <div className="relative aspect-[4/3]">
              <img
                src={getPostImage(post.id, index)}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {post.is_featured && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow pt-6 pb-0 flex flex-col">
            {/* Tags moved to top, replacing category */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            
            {/* Date moved after title */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <CalendarIcon className="h-3 w-3" />
              <span>{formatDate(post.published_at)}</span>
            </div>
            
            {post.summary && (
              <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
                {post.summary}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="pt-6 pb-6">
            {/* Author */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              {post.author_avatar && (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span>{post.author_name}</span>
            </div>

            {/* Voting and Comments */}
            <div className="flex items-center justify-between pt-4 border-t w-full">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleVote(e, post.id, 'up')}
                  className={`${getVoteColor(post.id, 'up')} hover:bg-transparent p-1`}
                >
                  <ArrowUp className="w-4 h-4 mr-1" />
                  {post.up_votes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleVote(e, post.id, 'down')}
                  className={`${getVoteColor(post.id, 'down')} hover:bg-transparent p-1`}
                >
                  <ArrowDown className="w-4 h-4 mr-1" />
                  {post.down_votes}
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  {post.comment_count}
                </div>
              </div>
            </div>
            
            {/* Read more button - positioned absolute bottom right */}
            <Button variant="outline" size="sm" asChild className="absolute bottom-4 right-4">
              <Link to={`/blog/${post.id}`}>Read more</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
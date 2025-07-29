import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <Card key={post.id} className="flex h-full flex-col gap-0 pt-0 group hover:shadow-md transition-shadow">
          <CardHeader className="overflow-hidden p-0">
            <div className="relative aspect-video">
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
          
          <CardContent className="flex-grow pt-6 pb-0">
            {post.category && (
              <Badge variant="outline" className="mb-2">
                {post.category}
              </Badge>
            )}
            <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.summary && (
              <p className="text-muted-foreground text-sm line-clamp-3">
                {post.summary}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-6">
            {/* Author and date */}
            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {post.author_avatar && (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>{post.author_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{post.up_votes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{post.comment_count}</span>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/blog/${post.id}`}>Read more</Link>
              </Button>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 w-full">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
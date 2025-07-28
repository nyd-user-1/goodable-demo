import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('blog_proposal_stats')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-6 lg:py-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse w-2/3" />
          </div>
        </div>
        <Separator className="my-8" />
        <div className="grid gap-10 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-video bg-muted rounded-md animate-pulse" />
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-6 lg:py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Blog</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={fetchPosts}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Policy Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Insights, analysis, and discussions on policy, governance, and civic engagement.
          </p>
        </div>
      </div>
      <Separator className="my-8" />
      {posts?.length ? (
        <div className="grid gap-10 sm:grid-cols-2">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="group relative flex flex-col space-y-2"
            >
              {/* Blog post image */}
              <div className="aspect-video rounded-md border overflow-hidden bg-muted">
                <img 
                  src={getPostImage(post.id, index)} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              <h2 className="text-2xl font-extrabold group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              
              {post.summary && (
                <p className="text-muted-foreground line-clamp-3">
                  {post.summary}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
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
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{post.view_count} views</span>
                <span>{post.up_votes + post.down_votes} votes</span>
                <span>{post.comment_count} comments</span>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{post.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <Link to={`/blog/${post.id}`} className="absolute inset-0">
                <span className="sr-only">View Article</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden bg-muted">
            <img 
              src="/goodable-heart.avif" 
              alt="No posts yet" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts published yet</h3>
          <p className="text-muted-foreground">
            Check back soon for policy insights and analysis.
          </p>
        </div>
      )}
    </div>
  );
}
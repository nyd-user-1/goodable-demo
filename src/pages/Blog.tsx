import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  BlogHeader, 
  BlogSearchFilters, 
  BlogGrid, 
  BlogLoadingSkeleton, 
  BlogErrorState, 
  BlogEmptyState 
} from '@/components/features/blog';

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

interface Filters {
  search: string;
  category: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: '', category: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  // Get unique categories from posts
  const categories = useMemo(() => {
    const uniqueCategories = new Set(posts.map(post => post.category).filter(Boolean));
    return Array.from(uniqueCategories) as string[];
  }, [posts]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !filters.search || 
        post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (post.summary && post.summary.toLowerCase().includes(filters.search.toLowerCase())) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase())));
      
      const matchesCategory = !filters.category || post.category === filters.category;
      
      return matchesSearch && matchesCategory;
    });
  }, [posts, filters]);

  const clearFilters = () => {
    setFilters({ search: '', category: '' });
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try the stats view first, if it fails, use the main table with assets
      let { data, error } = await supabase
        .from('blog_proposal_stats')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      // If the view doesn't exist or doesn't have assets, fall back to main table
      if (error || (data && data.length > 0 && !data[0].hasOwnProperty('assets'))) {
        console.log('Using blog_proposals table for assets support');
        const result = await supabase
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
            author_name: post.profiles?.display_name || post.profiles?.username || 'Goodable',
            author_avatar: post.profiles?.avatar_url,
            up_votes: 0,
            down_votes: 0,
            comment_count: 0,
            total_score: 0
          }));
        }
      }

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
      <div className="container mx-auto px-4 py-6">
        <BlogLoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <BlogErrorState error={error} onRetry={fetchPosts} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <BlogHeader 
        postsCount={filteredPosts.length} 
        categoriesCount={categories.length}
      />
      
      <BlogSearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />
      
      {filteredPosts.length > 0 ? (
        <BlogGrid posts={filteredPosts} />
      ) : (
        <BlogEmptyState 
          searchTerm={filters.search || filters.category}
          onClearFilters={clearFilters}
        />
      )}
    </div>
  );
}
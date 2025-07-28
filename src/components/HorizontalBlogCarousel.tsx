import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export default function HorizontalBlogCarousel() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_proposals')
          .select(`
            id,
            title,
            summary,
            category,
            published_at,
            author_id,
            profiles!blog_proposals_author_id_fkey(username, display_name)
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching blog posts:', error);
          return;
        }

        const formattedPosts = data?.map((post, index) => ({
          id: post.id,
          title: post.title,
          excerpt: post.summary || 'No summary available',
          date: new Date(post.published_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          category: post.category || 'Policy',
          imageUrl: [
            "/goodable-botanical.avif",
            "/goodable-heart.avif", 
            "/goodable-night.avif",
            "/goodable-path.avif",
            "/goodable-dandelion.avif",
            "/goodable-dream-state.avif"
          ][index % 6],
          slug: post.id,
          author: post.profiles?.display_name || post.profiles?.username || 'Anonymous'
        })) || [];

        setPosts(formattedPosts);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const title = "Good Trouble";
  const description = "Browse Goodable's original policy proposals";

  return (
    <section className="w-full py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
              <p className="text-muted-foreground max-w-[700px]">
                {description}
              </p>
            </div>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <CarouselItem
                    key={`skeleton-${index}`}
                    className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <Card className="flex h-full flex-col overflow-hidden pt-0">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted animate-pulse">
                      </div>
                      <CardHeader className="grow grid-rows-none">
                        <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
                        <div className="h-6 bg-muted animate-pulse rounded mb-2"></div>
                        <div className="h-4 bg-muted animate-pulse rounded"></div>
                      </CardHeader>
                      <CardFooter>
                        <div className="h-10 bg-muted animate-pulse rounded w-full"></div>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                <CarouselItem
                  key={post.id}
                  className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Card className="flex h-full flex-col overflow-hidden pt-0">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="object-cover transition-transform hover:scale-105 w-full h-full"
                      />
                    </div>
                    <CardHeader className="grow grid-rows-none">
                      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.category}</span>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>

                    <CardFooter>
                      <Button asChild>
                        <Link to={`/blog/${post.id}`}>
                          Read more
                          <span className="sr-only">
                            Read more about {post.title}
                          </span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))
              ) : (
                // No posts message
                <CarouselItem className="pl-4 w-full">
                  <Card className="flex h-full flex-col items-center justify-center p-8">
                    <p className="text-muted-foreground text-center">
                      No policy proposals available at the moment.
                    </p>
                  </Card>
                </CarouselItem>
              )}
            </CarouselContent>
            <div className="mt-4 flex justify-end gap-2">
              <CarouselPrevious className="static -translate-x-0 translate-y-0" />
              <CarouselNext className="static translate-x-0 translate-y-0" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
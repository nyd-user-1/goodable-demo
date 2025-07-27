import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  // Sample blog posts data
  const posts = [
    {
      id: "1",
      title: "Creating Accessible Web Applications with React and ARIA",
      excerpt:
        "Learn how to build web applications that are accessible to everyone using React best practices and ARIA attributes.",
      date: "Apr 15, 2023",
      category: "Development",
      imageUrl: "/u5335162829_A_luminous_botanical_garden_where_policy_ideas_gr_1fdebf67-68a6-45a4-a78c-0a9d56a0734c_2.avif",
      slug: "creating-accessible-web-applications",
    },
    {
      id: "2",
      title: "The Future of Design Systems in 2023",
      excerpt:
        "Explore the trends and innovations shaping design systems and component libraries this year.",
      date: "Mar 28, 2023",
      category: "Design",
      imageUrl: "/u5335162829_A_luminous_botanical_garden_where_policy_ideas_gr_1fdebf67-68a6-45a4-a78c-0a9d56a0734c_3.avif",
      slug: "future-of-design-systems",
    },
    {
      id: "3",
      title: "Optimizing Performance in Next.js Applications",
      excerpt:
        "Practical strategies to improve loading times and overall performance in your Next.js web applications.",
      date: "Mar 12, 2023",
      category: "Performance",
      imageUrl: "/u5335162829_A_luminous_botanical_garden_where_policy_ideas_gr_83d5ad78-6216-4ef5-a78e-d9ec077213c9_0.avif",
      slug: "optimizing-nextjs-performance",
    },
    {
      id: "4",
      title: "Crafting Effective User Onboarding Experiences",
      excerpt:
        "How to design user onboarding that reduces friction and increases conversion rates for your product.",
      date: "Feb 24, 2023",
      category: "UX Design",
      imageUrl: "/u5335162829_A_solitary_figure_steps_through_an_ordinary_door__4e09c9bc-3405-4488-819f-fb6c815259d2_0.avif",
      slug: "effective-user-onboarding",
    },
    {
      id: "5",
      title: "Building a Design Portfolio That Stands Out",
      excerpt:
        "Tips and strategies for creating a portfolio that showcases your best work and attracts clients.",
      date: "Feb 10, 2023",
      category: "Career",
      imageUrl: "/u5335162829_Night_scene_where_each_act_of_civic_kindness_crea_4a44b9ca-25de-4638-9b13-46e4a172579d_1 (1).avif",
      slug: "design-portfolio-tips",
    },
    {
      id: "6",
      title: "Responsive Design in the Age of Foldable Devices",
      excerpt:
        "How to adapt your responsive design strategies for the emerging market of foldable and dual-screen devices.",
      date: "Jan 28, 2023",
      category: "Design",
      imageUrl: "/u5335162829_a_vast_field_of_wildflowers_-_vibrant_purples_yel_5cd62d21-a53a-49bb-9b41-31efcc36c6de_3.avif",
      slug: "responsive-design-foldable-devices",
    },
  ];

  const title = "Latest Writing";
  const description = "Browse through my latest articles and insights";

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
              {posts.map((post) => (
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
                      <Button asChild variant="ghost">
                        <Link to="#">
                          Read more
                          <span className="sr-only">
                            Read more about {post.title}
                          </span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
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
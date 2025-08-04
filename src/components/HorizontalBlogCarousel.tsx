import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  // Policy proposal blog posts
  const posts = [
    {
      id: "1",
      title: "A Digital Bill of Rights",
      excerpt:
        "Five Digital Rights: Privacy, Access, Identity, Explanation, Participation. Five Freedoms from Manipulation, Surveillance, Algorithmic Discrimination, Digital Addiction, and Forced Engagement.",
      date: "Apr 15, 2023",
      category: "Digital Rights",
      imageUrl: "/goodable-botanical.avif",
      slug: "digital-bill-of-rights",
    },
    {
      id: "2",
      title: "National Design Code",
      excerpt:
        "Prioritizes intentional design over manipulative engagement and design practices.",
      date: "Mar 28, 2023",
      category: "Digital Governance",
      imageUrl: "/goodable-heart.avif",
      slug: "public-design-code",
    },
    {
      id: "3",
      title: "PrivateSite™ Certification",
      excerpt:
        "Badge and compliance framework for websites meeting high standards for user dignity, minimal data collection, dark mode defaults, and scheduled offline hours.",
      date: "Mar 12, 2023",
      category: "Privacy",
      imageUrl: "/goodable-night.avif",
      slug: "privatesite-certification",
    },
    {
      id: "4",
      title: "Trust Framework",
      excerpt:
        "A trust layer for civic tech establishing transparency metrics, verification badges, audit mechanisms, and public feedback systems.",
      date: "Feb 24, 2023",
      category: "Trust & Safety",
      imageUrl: "/goodable-path.avif",
      slug: "trust-framework-badge",
    },
    {
      id: "5",
      title: "Public Stack Incentives",
      excerpt:
        "Incentivizing open-source civic infrastructure through grants, tax credits, and procurement preferences for public good technology.",
      date: "Feb 15, 2023",
      category: "Open Source",
      imageUrl: "/goodable-botanical.avif",
      slug: "public-stack-incentives",
    },
    {
      id: "6",
      title: "Digital Licensing Framework",
      excerpt:
        "Professional licensing for high-impact civic tech developers, requiring ethical standards, technical competence, and continuing education.",
      date: "Feb 8, 2023",
      category: "Professional Standards",
      imageUrl: "/goodable-heart.avif",
      slug: "digital-licensing-framework",
    },
    {
      id: "7",
      title: "Public AI Sandbox",
      excerpt:
        "Safe experimentation zone for AI tools aligned with public values, enabling cross-agency collaboration, R&D funding, and controlled pilots.",
      date: "Jan 28, 2023",
      category: "AI Policy",
      imageUrl: "/goodable-night.avif",
      slug: "public-ai-sandbox",
    },
  ];

  const title = "Good Trouble?";
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
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {posts.map((post) => (
                <CarouselItem
                  key={post.id}
                  className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Card 
                    className="flex h-full flex-col overflow-hidden pt-0 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate('/auth-2')}
                  >
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
                        <Link to="/auth-2">
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
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
      slug: "a-digital-bill-of-rights",
    },
    {
      id: "2",
      title: "National Design Code",
      excerpt:
        "Prioritizes intentional design over manipulative engagement and design practices.",
      date: "Mar 28, 2023",
      category: "Digital Governance",
      imageUrl: "/goodable-heart.avif",
      slug: "national-design-code",
    },
    {
      id: "3",
      title: "Area Codes 2.0",
      excerpt:
        "Area codes tell you where a call is coming from. A uniform digital equivalent is long overdue.",
      date: "Mar 12, 2023",
      category: "Privacy",
      imageUrl: "/goodable-night.avif",
      slug: "area-codes-2-0",
    },
    {
      id: "4",
      title: "Civic-First AI Sandbox",
      excerpt:
        "AI is governed by tokens. This inherently separates the haves from the have nots. This fact accelerates inequality at lightspeed.",
      date: "Feb 24, 2023",
      category: "Trust & Safety",
      imageUrl: "/goodable-path.avif",
      slug: "civic-firrst-ai-sandbox",
    },
    {
      id: "5",
      title: "The Public Stack Incentive",
      excerpt:
        "Stop giving money to IDAs. Start giving money to coders and designers to accelerate the buildout of a public digital infrastructure.",
      date: "Feb 15, 2023",
      category: "Open Source",
      imageUrl: "/goodable-botanical.avif",
      slug: "public-stack-incentives",
    },
    {
      id: "6",
      title: "Digital Licensing Framework",
      excerpt:
        "Electricians are licensned for a reason. Nowadays, code can do far more harm than electricity. Start a licensing process for requiring public first ethical standards, technical competency, and continuing education.",
      date: "Feb 8, 2023",
      category: "Professional Standards",
      imageUrl: "/goodable-heart.avif",
      slug: "digital-licensing-framework",
    },
    {
      id: "7",
      title: "Mandate Cigarette Warnings for Digital Products ",
      excerpt:
        "Certain digital products leverage dark patterns to consume your time and attention. Mandate clear warnings and disclosures.",
      date: "Jan 28, 2023",
      category: "AI Policy",
      imageUrl: "/goodable-night.avif",
      slug: "mandate-cigarette-warnings-for-digital-products",
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
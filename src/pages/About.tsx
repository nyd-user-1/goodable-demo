import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Mail,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  ArrowRight,
} from 'lucide-react';

const About = () => {
  return (
    <div className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 2xl:max-w-[1400px]">
        <div className="gap-12 md:grid md:grid-cols-12 lg:gap-16">
          {/* Profile Image and Quick Stats */}
          <div className="flex flex-col items-center md:col-span-5 lg:col-span-4">
            <div className="border-primary/10 relative mb-8 h-56 w-56 overflow-hidden rounded-full border-4 md:h-64 md:w-64 lg:h-72 lg:w-72">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3"
                alt="Profile Picture"
                className="object-cover"
                fetchPriority="high"
              />
            </div>

            {/* Quick Stats */}
            <div className="bg-muted/30 w-full max-w-sm space-y-4 rounded-xl border p-6">
              <h3 className="text-lg font-semibold">Quick Facts</h3>

              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground h-5 w-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Experience</p>
                    <p className="font-medium">8+ Years</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="text-muted-foreground h-5 w-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Location</p>
                    <p className="font-medium">San Francisco, CA</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="text-muted-foreground h-5 w-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Contact</p>
                    <a
                      href="mailto:hello@example.com"
                      className="hover:text-primary font-medium"
                    >
                      hello@example.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" size="icon" asChild>
                  <a href="#" aria-label="LinkedIn Profile">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="#" aria-label="GitHub Profile">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="#" aria-label="Twitter Profile">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* About Me Content */}
          <div className="mt-12 flex flex-col md:col-span-7 md:mt-0 lg:col-span-8">
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="font-normal tracking-wide uppercase"
              >
                About Me
              </Badge>
            </div>

            <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Hi, I&apos;m <span className="text-primary">Alex Morgan</span>
              <br />
              Full Stack Developer
            </h1>

            <div className="space-y-4 text-lg">
              <p>
                With over 8 years of experience building web and mobile
                applications, I specialize in creating robust, user-focused
                software solutions that solve real business problems.
              </p>

              <p>
                My journey in tech began at Stanford University where I earned
                my degree in Computer Science. Since then, I&apos;ve worked with
                startups and enterprise companies across fintech, healthcare,
                and e-commerce industries, developing everything from
                consumer-facing applications to complex backend systems.
              </p>

              <p>
                I&apos;m passionate about clean code, thoughtful architecture,
                and continuous learning. When I&apos;m not coding, you&apos;ll
                find me hiking in the Bay Area, experimenting with new cooking
                recipes, or mentoring upcoming developers.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button className="gap-2" asChild>
                <a href="#contact">
                  Get in Touch
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <a href="#projects">
                  View My Work
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Mail,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  ArrowRight,
  Sun,
  Command,
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 2xl:max-w-[1400px]">
          <div className="flex h-14 items-center justify-between">
            {/* Left - Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <img src="/goodable-heart-pwa.png" alt="Goodable" className="h-10 w-10 rounded-lg" />
                <span className="text-xl font-semibold">Goodable</span>
              </Link>
            </div>

            {/* Center - Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/about" className="text-sm font-medium text-foreground hover:text-foreground/80">
                About
              </Link>
              <Link to="/academy" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Academy
              </Link>
              <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link to="/free-trial" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Free Trial
              </Link>
              <Link to="/use-cases" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Use Cases
              </Link>
              <Link to="/non-profits" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Non Profits
              </Link>
              <Link to="/plans" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
            </nav>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Sun className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Command className="h-4 w-4" />
              </Button>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-sm">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4 2xl:max-w-[1400px]">
          <div className="gap-12 md:grid md:grid-cols-12 lg:gap-16">
            {/* Quick Stats - Now at top left without photo */}
            <div className="flex flex-col items-center md:col-span-5 lg:col-span-4">
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
                        className="hover:text-foreground font-medium"
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
                Hi, I'm <span className="text-muted-foreground">Alex Morgan</span>
                <br />
                Full Stack Developer
              </h1>

              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  With over 8 years of experience building web and mobile
                  applications, I specialize in creating robust, user-focused
                  software solutions that solve real business problems.
                </p>

                <p>
                  My journey in tech began at Stanford University where I earned
                  my degree in Computer Science. Since then, I've worked with
                  startups and enterprise companies across fintech, healthcare,
                  and e-commerce industries, developing everything from
                  consumer-facing applications to complex backend systems.
                </p>

                <p>
                  I'm passionate about clean code, thoughtful architecture,
                  and continuous learning. When I'm not coding, you'll
                  find me hiking in the Bay Area, experimenting with new cooking
                  recipes, or mentoring upcoming developers.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button variant="secondary" className="gap-2" asChild>
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
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 2xl:max-w-[1400px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left - Built with */}
            <p className="text-sm text-muted-foreground">
              Built with{' '}
              <a href="https://nextjs.org" className="underline hover:text-foreground">
                Next.js
              </a>
              {' '}and{' '}
              <a href="https://ui.shadcn.com" className="underline hover:text-foreground">
                shadcn/ui
              </a>
              .
            </p>

            {/* Right - Links and Copyright */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/terms" className="hover:text-foreground">
                Terms
              </a>
              <a href="/privacy" className="hover:text-foreground">
                Privacy
              </a>
              <a href="/contact" className="hover:text-foreground">
                Contact
              </a>
              <span>© 2026 Your Company. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;

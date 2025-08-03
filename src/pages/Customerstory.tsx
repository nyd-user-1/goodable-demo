import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomerStory = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo placeholder */}
            <div className="w-18 h-5 bg-primary/20 rounded"></div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary">Features</a>
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary">Method</a>
              <a href="#" className="text-sm font-medium text-foreground/80 hover:text-primary font-semibold">Customers</a>
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary">Changelog</a>
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary">Integrations</a>
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary">Pricing</a>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-foreground hover:text-primary">Company</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary">Log in</a>
              <Button size="sm" className="bg-gradient-to-r from-[#455eb5] to-[#673fd7] text-white">
                Sign up
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Story Content */}
          <div className="lg:col-span-2">
            {/* Back Link */}
            <Button 
              variant="ghost" 
              className="mb-6 -ml-3 text-[#3D63DD] hover:text-[#3D63DD]/80"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {/* Story Header */}
            <div className="space-y-6 mb-12">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Customer Story</p>
                <h1 className="text-4xl font-semibold text-foreground">Descript</h1>
              </div>
              
              <div className="border-b border-border/40 pb-12">
                <p className="text-xl text-muted-foreground">Designed for teams like us</p>
              </div>

              {/* Quote Section */}
              <div className="space-y-8">
                <div className="relative">
                  <span className="text-6xl text-muted-foreground/30 font-serif absolute -left-12 -top-4">"</span>
                  <blockquote className="text-xl leading-relaxed text-foreground ml-8">
                    Linear's performance is incredible - the best perceived speed of any web app I've ever used.
                  </blockquote>
                </div>

                {/* Story Content */}
                <div className="prose prose-gray max-w-none">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We were constantly fighting our existing issue tracking tool to support EPD. We felt there was a lot of "work about work" to keep tasks and projects organized. Views easily got out of date and required fine tuning. It was difficult to search for issues and then save those views. It became clear to us that we were trying to get our previous issue tracker to do something that it simply wasn't built to do well.
                  </p>

                  <p className="text-sm leading-relaxed text-muted-foreground mt-4">
                    Linear is different. It has a better model and structure for engineering orgs. Sprints, points, priority, and status are all treated as first class properties of tasks. Search and filtering are powerful and the timeline view is one of the best I've seen. The command palette and keyboard shortcuts make it way faster to move around and do things, too.
                  </p>

                  <p className="text-sm leading-relaxed text-muted-foreground mt-4">
                    Linear is more opinionated than other tools. There aren't multiple ways to use it. This actually has made it easier to learn and adopt across the organization. It's also an app full of great ideas that can inspire our own product development.
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-8">
                  <div className="w-60 h-16 bg-muted rounded mb-4"></div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Andrew Mason</p>
                    <p className="text-sm text-muted-foreground">CEO & Founder</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="border-t border-border/20 pt-8">
                <div className="flex justify-between items-center">
                  <Button variant="ghost" className="flex items-center space-x-3 text-[#3D63DD] hover:text-[#3D63DD]/80">
                    <div className="w-9 h-9 bg-muted rounded"></div>
                    <div className="text-left">
                      <p className="text-xs">← Previous</p>
                      <p className="text-xs font-medium text-foreground">Loom</p>
                    </div>
                  </Button>
                  
                  <Button variant="ghost" className="flex items-center space-x-3 text-[#3D63DD] hover:text-[#3D63DD]/80">
                    <div className="text-right">
                      <p className="text-xs">Next →</p>
                      <p className="text-xs font-medium text-foreground">The Browser Company</p>
                    </div>
                    <div className="w-9 h-9 bg-muted rounded"></div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 border-border/40 relative">
              {/* Company Logo */}
              <div className="absolute -top-15 left-6">
                <div className="w-30 h-30 bg-muted rounded-3xl"></div>
              </div>
              
              <CardContent className="pt-20 pb-6 px-6 space-y-6">
                {/* Company Info */}
                <div className="space-y-4 border-b border-border/40 pb-6">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Descript</h3>
                    <p className="text-sm text-muted-foreground mt-1">All-in-one video editing, as easy as a doc</p>
                    <p className="text-sm text-[#3D63DD] mt-2">descript.com</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-border/40 pb-6">
                    <p className="text-xs font-medium text-foreground">Founded</p>
                    <p className="text-sm text-muted-foreground">San Francisco, 2017</p>
                  </div>

                  <div className="space-y-2 border-b border-border/40 pb-6">
                    <p className="text-xs font-medium text-foreground">Investors</p>
                    <p className="text-sm text-muted-foreground">Spark Capital, Andreessen Horowitz</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Building with Linear since</p>
                    <p className="text-sm text-muted-foreground">December 2020</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/10 bg-background/80 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-muted rounded"></div>
                  <span className="text-sm text-muted-foreground">Linear - Designed Worldwide</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="w-5 h-5 bg-muted rounded"></div>
                  <div className="w-5 h-5 bg-muted rounded"></div>
                  <div className="w-5 h-5 bg-muted rounded"></div>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Integrations</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Changelog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Docs</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Linear Method</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Download</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">About us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-sm text-foreground hover:text-primary">Customers</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Brand</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Community</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">DPA</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Report a vulnerability</a></li>
              </ul>
            </div>

            {/* Developers Links */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Developers</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">API</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Status</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">GitHub</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Magic</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerStory;
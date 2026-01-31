import { useState } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

const Academy = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-16">
        <section className="container mx-auto px-4 py-12 md:px-6 2xl:max-w-[1400px]">
          <div>
            {/* Section Header */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                NYSgpt Academy
              </h1>
              <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
                Learn to leverage the tools of modern civic engagement and become an effective advocate for your community.
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl sm:h-80 md:h-[500px]">
              <img
                src="/bill-analysis-actions.png"
                alt="NYSgpt Academy civic engagement education"
                className="object-cover object-top w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:max-w-[60%]">
                <p className="mb-2 text-sm font-medium text-white/80">
                  Civic Education
                </p>
                <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  From learning to leading
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Platform Training
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Legislative Process
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Advocacy Skills
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Guest Speakers
                  </Badge>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid gap-12 md:grid-cols-3">
              {/* Left Column - Info */}
              <div className="space-y-6 md:col-span-1">
                <div>
                  <h4 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Focus
                  </h4>
                  <p className="mt-1 text-lg font-medium">
                    Education
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Hide Full Article' : 'View Full Article'}
                  <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
                </Button>
              </div>

              {/* Right Column - Overview */}
              <div className="md:col-span-2">
                <h4 className="mb-6 text-xl font-semibold md:text-2xl">
                  The academy.
                </h4>
                <p className="text-muted-foreground text-lg">
                  NYSgpt Academy is our educational initiative designed to transform ordinary citizens into effective policy advocates. We believe that everyone has the capacity to shape the policies that affect their lives.
                </p>

                {/* Divider line */}
                <div className="mt-6 border-t" />

                {/* Expandable full content */}
                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <article className="prose prose-lg dark:prose-invert max-w-none pt-8">
                      <section className="mb-10">
                        <p>
                          Our curriculum combines practical platform training with deep insights into the legislative process. You'll learn not just how to use NYSgpt's tools, but how to think strategically about advocacy, build coalitions, and make your voice heard at every level of government.
                        </p>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Who Is This For?</h2>
                        <p>
                          The Academy welcomes everyone who wants to participate more effectively in democracy:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li><strong>Community organizers</strong> looking to amplify their impact with better tools and strategies</li>
                          <li><strong>Nonprofit staff</strong> who need to track legislation and mobilize supporters quickly</li>
                          <li><strong>Concerned parents</strong> advocating for better schools, safer neighborhoods, or family-friendly policies</li>
                          <li><strong>Small business owners</strong> navigating regulations and advocating for economic policies</li>
                          <li><strong>Students and young people</strong> finding their voice in civic life for the first time</li>
                          <li><strong>Anyone</strong> who has ever thought "someone should do something about this" and realized they could be that someone</li>
                        </ul>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Mastering the Platform</h3>
                        <p>
                          Learn to use every feature of NYSgpt to its full potential. Track bills, set up smart alerts, use AI-powered analysis to understand complex legislation, and organize your advocacy work efficiently.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Understanding the Legislative Process</h3>
                        <p>
                          Demystify how laws are actually made. Learn to read a bill, understand committee structures, identify key decision points, and recognize when and how to intervene effectively.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Effective Communication</h3>
                        <p>
                          Craft messages that get results. Learn the difference between constituent contacts that get filed away and those that change minds. Practice writing testimony, preparing for town halls, and communicating with legislative staff.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Building Coalitions</h3>
                        <p>
                          No one changes policy alone. Learn to identify potential allies, build relationships across difference, coordinate campaigns, and leverage collective power.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Strategic Thinking</h3>
                        <p>
                          Move beyond reactive advocacy to proactive strategy. Learn to set goals, identify leverage points, time your interventions for maximum impact, and measure your success.
                        </p>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Guest Speakers</h2>
                        <p>
                          Learn from people who have been in the trenches. Our guest speaker series brings in leaders from nonprofits, advocacy organizations, and mission-driven institutions:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Executive directors of statewide advocacy organizations</li>
                          <li>Grassroots organizers who have built movements from the ground up</li>
                          <li>Former legislative staff who know how decisions really get made</li>
                          <li>Policy researchers and communications experts</li>
                          <li>Leaders from environmental, economic justice, healthcare, and civil rights organizations</li>
                        </ul>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Academy Format</h2>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Self-Paced Courses</h3>
                        <p>
                          Work through our comprehensive curriculum on your own schedule. Each module includes video lessons, interactive exercises, and practical assignments.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Live Workshops</h3>
                        <p>
                          Join scheduled sessions led by experienced instructors. Small-group workshops allow for real-time questions, peer learning, and hands-on practice.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Cohort Programs</h3>
                        <p>
                          For deeper engagement, cohort programs bring together groups who work through the curriculum together over several weeks, building relationships and collaborating on shared advocacy goals.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3">Office Hours</h3>
                        <p>
                          Get personalized guidance from Academy instructors during regular office hours for strategy questions, legislative situations, or feedback on your approach.
                        </p>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Real Impact</h2>
                        <p>
                          Our graduates have:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Successfully advocated for local zoning changes that preserved affordable housing</li>
                          <li>Organized testimony that helped defeat harmful legislation</li>
                          <li>Built coalitions that secured funding for community health programs</li>
                          <li>Trained others in their organizations, multiplying their impact</li>
                          <li>Run for local office themselves, taking their advocacy to the next level</li>
                        </ul>
                      </section>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSimple />
    </div>
  );
};

export default Academy;

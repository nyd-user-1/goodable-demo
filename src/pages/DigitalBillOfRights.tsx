import { useState } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DigitalBillOfRights = () => {
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
                A Digital Bill of Rights
              </h1>
              <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
                Fundamental rights and freedoms for the digital age—because the principles that protect human dignity offline must extend to our lives online.
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl sm:h-80 md:h-[500px]">
              <img
                src="/bills-image-2.png"
                alt="NYSgpt digital rights and freedoms"
                className="object-cover object-top w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:max-w-[60%]">
                <p className="mb-2 text-sm font-medium text-white/80">
                  Digital Rights
                </p>
                <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  Protecting human dignity in the digital age
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Privacy
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Well-Being
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Security
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    +7 more
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
                    Digital Rights
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
                  The rights.
                </h4>
                <p className="text-muted-foreground text-lg">
                  The digital revolution has brought extraordinary benefits, but it has also brought new threats to human dignity, autonomy, and well-being. The time has come to establish fundamental rights and freedoms for the digital age.
                </p>

                {/* Divider line */}
                <div className="mt-6 border-t" />

                {/* Expandable full content */}
                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <article className="prose prose-lg dark:prose-invert max-w-none pt-8">
                      <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6">Five Digital Rights</h2>

                        <div className="space-y-8">
                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">1</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">The Right to Digital Privacy</h3>
                                <p className="text-muted-foreground m-0">
                                  People must have control over their data. Personal information cannot be collected, shared, or monetized without explicit consent. Your digital life belongs to you—not to corporations, not to advertisers, not to data brokers.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">2</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">The Right to Digital Well-Being</h3>
                                <p className="text-muted-foreground m-0">
                                  Individuals must be able to live free from digital overstimulation, endless notifications, and algorithmic addiction. Technology should serve your goals, not hijack your attention for profit.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">3</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">The Right to Digital Security</h3>
                                <p className="text-muted-foreground m-0">
                                  Every person has the right to a secure digital environment, free from hacking, identity theft, and AI-driven exploitation. Your digital identity deserves the same protection as your physical safety.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">4</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">The Right to Human-Centered AI</h3>
                                <p className="text-muted-foreground m-0">
                                  AI must enhance human potential—not replace workers, reinforce bias, or make life-altering decisions without oversight. You have the right to understand how AI affects your life and to challenge decisions made by algorithms.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">5</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">The Right to a Humane Digital Childhood</h3>
                                <p className="text-muted-foreground m-0">
                                  Children must be protected from predatory algorithms, invasive data collection, and engagement-driven exploitation. Every child deserves to grow up without being targeted by systems designed to maximize screen time or manipulate their developing minds for profit.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6">Five Digital Freedoms</h2>

                        <div className="space-y-8">
                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">6</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">Freedom of Access</h3>
                                <p className="text-muted-foreground m-0">
                                  The internet must be open, affordable, and accessible to all, free from corporate gatekeeping or government-imposed restrictions. No one should be excluded from the digital commons by poverty, geography, or arbitrary barriers.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">7</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">Freedom of Expression & Knowledge</h3>
                                <p className="text-muted-foreground m-0">
                                  People have the right to communicate, create, and access information without undue censorship or manipulation. The free exchange of ideas is the foundation of democracy and human progress.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">8</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">Freedom from Exploitation</h3>
                                <p className="text-muted-foreground m-0">
                                  No one should be subjected to mass surveillance, data harvesting, or algorithmic manipulation designed to mislead or exploit. Your attention, your data, and your choices are not raw materials to be extracted for others' profit.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">9</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">Freedom from Digital Tyranny</h3>
                                <p className="text-muted-foreground m-0">
                                  No person should be subject to cyber warfare, disinformation campaigns, or exclusion from digital spaces essential for participation in society. The digital realm must not become a tool of oppression.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold">10</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-2 mt-0">Freedom from Digital Dependency</h3>
                                <p className="text-muted-foreground m-0">
                                  Technology must not be designed to manipulate, distract, or foster addiction. True freedom includes the freedom to step away—to live a full human life that isn't mediated by screens and algorithms.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
                        <p>
                          At NYSgpt, we don't just advocate for these rights and freedoms—we build them into our platform. Every feature we develop, every algorithm we deploy, and every business decision we make is evaluated against these principles.
                        </p>
                        <p>
                          Read our <Link to="/constitution" className="text-primary hover:underline">full constitution</Link> to see how these principles translate into specific commitments for our AI systems and our company.
                        </p>
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

export default DigitalBillOfRights;

import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Link } from 'react-router-dom';
import { Shield, Lock, Heart, Brain, Baby, Globe, MessageSquare, Eye, Swords, Unplug } from 'lucide-react';

const DigitalBillOfRights = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Navigation */}
      <ChatHeader />

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              A Digital Bill of Rights
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Fundamental rights and freedoms for the digital age—because the principles that protect human dignity offline must extend to our lives online.
            </p>
          </div>

          {/* Essay Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Why We Need Digital Rights</h2>
              <p>
                The framers of the Bill of Rights could not have imagined a world where our thoughts are tracked, our attention is harvested, and algorithms shape what we see, believe, and buy. Yet here we are—living more of our lives online than ever before, with fewer protections than we have in the physical world.
              </p>
              <p>
                The digital revolution has brought extraordinary benefits: instant access to information, connection across distances, tools that amplify human capability. But it has also brought new threats to human dignity, autonomy, and well-being. Our data is collected without meaningful consent. Our attention is manipulated for profit. Our children are targets of algorithmic exploitation. Our democracies are undermined by disinformation and digital manipulation.
              </p>
              <p>
                The time has come to establish fundamental rights and freedoms for the digital age—not as aspirations, but as binding principles that technology must respect. This Digital Bill of Rights represents our commitment to building technology that enhances human life rather than diminishes it.
              </p>
            </section>

            {/* Five Digital Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Five Digital Rights</h2>
              <p className="mb-8">
                To ensure technology enhances human life rather than diminishes it, we recognize five fundamental rights:
              </p>

              <div className="space-y-8">
                {/* Right 1 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">The Right to Digital Privacy</h3>
                      <p className="text-muted-foreground m-0">
                        People must have control over their data. Personal information cannot be collected, shared, or monetized without explicit consent. Your digital life belongs to you—not to corporations, not to advertisers, not to data brokers. You have the right to know what data is collected about you, to access that data, to correct it, and to delete it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right 2 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">The Right to Digital Well-Being</h3>
                      <p className="text-muted-foreground m-0">
                        Individuals must be able to live free from digital overstimulation, endless notifications, and algorithmic addiction. Technology should serve your goals, not hijack your attention for profit. You have the right to technology that respects your time, your focus, and your mental health.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right 3 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">The Right to Digital Security</h3>
                      <p className="text-muted-foreground m-0">
                        Every person has the right to a secure digital environment, free from hacking, identity theft, and AI-driven exploitation. Your digital identity deserves the same protection as your physical safety. Technology providers have a duty to protect you from malicious actors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right 4 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">The Right to Human-Centered AI</h3>
                      <p className="text-muted-foreground m-0">
                        AI must enhance human potential—not replace workers, reinforce bias, or make life-altering decisions without oversight. Artificial intelligence should be a tool that empowers people, not a system that controls them. You have the right to understand how AI affects your life and to challenge decisions made by algorithms.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right 5 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Baby className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">The Right to a Humane Digital Childhood</h3>
                      <p className="text-muted-foreground m-0">
                        Children must be protected from predatory algorithms, invasive data collection, and engagement-driven exploitation. Every child deserves to grow up without being targeted by systems designed to maximize screen time, harvest their data, or manipulate their developing minds for profit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Five Digital Freedoms */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Five Digital Freedoms</h2>
              <p className="mb-8">
                To protect the internet itself from overreach, exploitation, and the technological consumption of meaningful institutions, we also recognize five core digital freedoms:
              </p>

              <div className="space-y-8">
                {/* Freedom 1 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Freedom of Access</h3>
                      <p className="text-muted-foreground m-0">
                        The internet must be open, affordable, and accessible to all, free from corporate gatekeeping or government-imposed restrictions. Digital participation has become essential for full participation in modern society. No one should be excluded from the digital commons by poverty, geography, or arbitrary barriers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Freedom 2 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Freedom of Expression & Knowledge</h3>
                      <p className="text-muted-foreground m-0">
                        People have the right to communicate, create, and access information without undue censorship or manipulation. The free exchange of ideas is the foundation of democracy and human progress. This freedom includes both the right to speak and the right to access the speech of others.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Freedom 3 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Eye className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Freedom from Exploitation</h3>
                      <p className="text-muted-foreground m-0">
                        No one should be subjected to mass surveillance, data harvesting, or algorithmic manipulation designed to mislead or exploit. Your attention, your data, and your choices are not raw materials to be extracted for others' profit. Freedom means being free from systems designed to exploit human psychology for commercial gain.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Freedom 4 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Swords className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Freedom from Digital Tyranny</h3>
                      <p className="text-muted-foreground m-0">
                        No person should be subject to cyber warfare, disinformation campaigns, or exclusion from digital spaces essential for participation in society. The digital realm must not become a tool of oppression—whether by governments, corporations, or malicious actors. Democracy requires a digital environment where truth can compete and citizens can participate.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Freedom 5 */}
                <div className="bg-muted/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Unplug className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Freedom from Digital Dependency</h3>
                      <p className="text-muted-foreground m-0">
                        Technology must not be designed to manipulate, distract, or foster addiction. Individuals must have the ability to disconnect without penalty. True freedom includes the freedom to step away—to live a full human life that isn't mediated by screens and algorithms. No one should be punished for choosing to be offline.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
              <p>
                At Goodable, we don't just advocate for these rights and freedoms—we build them into our platform. Every feature we develop, every algorithm we deploy, and every business decision we make is evaluated against these principles.
              </p>
              <p>
                We believe that technology companies have a responsibility to demonstrate that it's possible to build successful products while respecting human dignity. The Digital Bill of Rights isn't just an aspiration—it's a binding constraint on how we operate.
              </p>
              <p>
                Read our <Link to="/constitution" className="text-primary hover:underline">full constitution</Link> to see how these principles translate into specific commitments for our AI systems and our company.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">A Call to Action</h2>
              <p>
                These rights and freedoms should not be unique to Goodable users. They should be the birthright of every person who participates in the digital world. We call on other technology companies, policymakers, and citizens to join us in advocating for these protections.
              </p>
              <p>
                The digital age is still young. The norms and rules that will govern it are still being written. If we act now—if we insist that technology must serve human values—we can build a digital future that enhances human flourishing rather than diminishing it.
              </p>
              <p>
                The choice is ours. Let's choose well.
              </p>
            </section>
          </article>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default DigitalBillOfRights;

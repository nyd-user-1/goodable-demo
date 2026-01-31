import { useState } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

const AIFluency = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-16">
        <section className="container mx-auto px-4 py-12 md:px-6 max-w-[1100px]">
          <div>
            {/* Section Header */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                The 4C Framework
              </h1>
              <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
                A Foundation for Human-Centered AI
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl sm:h-80 md:h-[500px]">
              <img
                src="/multi-engine-chat-main-2.png"
                alt="NYSgpt AI-powered civic engagement platform"
                className="object-cover object-top w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:max-w-[60%]">
                <p className="mb-2 text-sm font-medium text-white/80">
                  AI Fluency
                </p>
                <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  Practical principles for responsible AI
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Choice
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Clarity
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Critical Thinking
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Coherence
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
                    AI Fluency
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
                  The framework.
                </h4>
                <p className="text-muted-foreground text-lg">
                  At NYSgpt, we believe that technology should expand human agency, not replace it. That's why we're grounded in the 4C Framework: Choice, Clarity, Critical Thinking, and Coherence.
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
                          AI is becoming deeply embedded in how decisions are made—about work, policy, communication, and civic life—but too often people are handed powerful tools without a clear framework for using them responsibly.
                        </p>
                        <p>
                          These four principles are not abstract ideals or marketing language. They are practical disciplines that help people collaborate with AI in ways that are effective, ethical, and grounded in shared reality. Together, they form the foundation of how we design our tools, train our systems, and support citizen participation in democratic life.
                        </p>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Choice: Preserving Human Agency</h2>
                        <p>
                          AI should never be the default decision-maker. The most important skill in an AI-enabled world is not knowing how to ask the perfect prompt—it's knowing when to use AI at all, and when not to. Choice means preserving human agency at every step of the process.
                        </p>
                        <p>
                          At NYSgpt, we treat AI as an assistant, not an authority. Our tools are designed to support human judgment, not override it. Users decide what questions to ask, what issues matter to them, and how they want to engage. AI helps illuminate options and surface information, but the responsibility for decisions always remains with people.
                        </p>
                        <p>
                          This matters deeply in civic life. Democracy depends on informed choice, not automated outcomes. By centering choice, we ensure that AI strengthens participation rather than quietly steering it.
                        </p>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Clarity: Making Complexity Understandable</h2>
                        <p>
                          Legislation, policy, and civic processes are often inaccessible by design. Legal language is dense. Procedures are opaque. Important decisions happen in ways that are hard for ordinary people to follow. Without clarity, participation becomes a privilege reserved for those with time, money, or specialized knowledge.
                        </p>
                        <p>
                          Clarity means translating complexity without distorting it. It means presenting information in plain language while preserving nuance. It means helping users understand not just what is happening, but why it matters and how it connects to their lives.
                        </p>
                        <p>
                          Our AI systems are trained to prioritize clarity over cleverness. They explain bills in straightforward terms, surface relevant context, and distinguish clearly between facts, interpretations, and open questions. When uncertainty exists, we acknowledge it rather than hiding it behind confident-sounding answers.
                        </p>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Critical Thinking: Keeping Humans in the Loop</h2>
                        <p>
                          AI systems are powerful, but they are not infallible. They can reflect bias, amplify errors, or present incomplete information with unwarranted confidence. Without critical thinking, users risk mistaking fluency for truth.
                        </p>
                        <p>
                          NYSgpt's approach to AI is explicitly designed to support skepticism, reflection, and inquiry. Our tools encourage users to ask follow-up questions, compare perspectives, and examine assumptions. We do not present AI outputs as final answers, but as starting points for deeper understanding.
                        </p>
                        <p>
                          Critical thinking is especially vital in civic contexts, where policies affect real lives and competing values are often at stake. Democracy requires disagreement, debate, and judgment—not automation.
                        </p>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Coherence: Building Shared Meaning</h2>
                        <p>
                          In a complex, information-saturated world, the greatest risk is not disagreement—it is fragmentation. When people no longer share a common understanding of facts, processes, or goals, collaboration collapses and trust erodes.
                        </p>
                        <p>
                          Coherence is about maintaining alignment across systems, narratives, and decisions. It ensures that information makes sense not just in isolation, but as part of a larger whole. In civic life, coherence is what allows people with different perspectives to operate within a shared reality, even when they disagree on outcomes.
                        </p>
                        <p>
                          At NYSgpt, coherence means that our tools speak the same language across contexts. A bill summary aligns with its legislative history. An impact analysis connects to real-world implications. AI explanations are consistent with primary sources and clearly traceable back to them.
                        </p>
                      </section>

                      <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Why the 4C Framework Matters</h2>
                        <p>
                          Taken together, Choice, Clarity, Critical Thinking, and Coherence form more than a framework for AI use—they form a philosophy for democratic technology.
                        </p>
                        <ul>
                          <li>People retain agency over decisions that affect their lives.</li>
                          <li>Complex systems become understandable rather than alienating.</li>
                          <li>AI supports judgment instead of replacing it.</li>
                          <li>Civic engagement is grounded in shared meaning and intelligibility.</li>
                        </ul>
                        <p>
                          Democracy does not fail because people don't care. It fails when systems become too complex, too opaque, or too disconnected from lived experience. The 4C Framework is our commitment to building AI that serves people, strengthens civic participation, and helps restore a democracy grounded in shared understanding.
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

export default AIFluency;

import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';

const AIFluency = () => {
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
              The 4C Framework
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A Foundation for Human-Centered AI
            </p>
          </div>

          {/* Essay Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <p>
                At Goodable, we believe that technology should expand human agency, not replace it. This belief is especially important when it comes to artificial intelligence. AI is becoming deeply embedded in how decisions are made—about work, policy, communication, and civic life—but too often people are handed powerful tools without a clear framework for using them responsibly.
              </p>
              <p>
                That's why Goodable is grounded in what we call the 4C Framework: Choice, Clarity, Critical Thinking, and Coherence.
              </p>
              <p>
                These four principles are not abstract ideals or marketing language. They are practical disciplines that help people collaborate with AI in ways that are effective, ethical, and grounded in shared reality. Together, they form the foundation of how we design our tools, train our systems, and support citizen participation in democratic life.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Choice: Preserving Human Agency</h2>
              <p>
                The first principle of the 4C Framework is Choice.
              </p>
              <p>
                AI should never be the default decision-maker. The most important skill in an AI-enabled world is not knowing how to ask the perfect prompt—it's knowing when to use AI at all, and when not to. Choice means preserving human agency at every step of the process.
              </p>
              <p>
                At Goodable, we treat AI as an assistant, not an authority. Our tools are designed to support human judgment, not override it. Users decide what questions to ask, what issues matter to them, and how they want to engage. AI helps illuminate options and surface information, but the responsibility for decisions always remains with people.
              </p>
              <p>
                This matters deeply in civic life. Democracy depends on informed choice, not automated outcomes. By centering choice, we ensure that AI strengthens participation rather than quietly steering it.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Clarity: Making Complexity Understandable</h2>
              <p>
                The second principle is Clarity.
              </p>
              <p>
                Legislation, policy, and civic processes are often inaccessible by design. Legal language is dense. Procedures are opaque. Important decisions happen in ways that are hard for ordinary people to follow. Without clarity, participation becomes a privilege reserved for those with time, money, or specialized knowledge.
              </p>
              <p>
                Goodable exists to change that.
              </p>
              <p>
                Clarity means translating complexity without distorting it. It means presenting information in plain language while preserving nuance. It means helping users understand not just what is happening, but why it matters and how it connects to their lives.
              </p>
              <p>
                Our AI systems are trained to prioritize clarity over cleverness. They explain bills in straightforward terms, surface relevant context, and distinguish clearly between facts, interpretations, and open questions. When uncertainty exists, we acknowledge it rather than hiding it behind confident-sounding answers.
              </p>
              <p>
                Clarity is not simplification for its own sake—it is respect for the user's intelligence.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Critical Thinking: Keeping Humans in the Loop</h2>
              <p>
                The third principle is Critical Thinking.
              </p>
              <p>
                AI systems are powerful, but they are not infallible. They can reflect bias, amplify errors, or present incomplete information with unwarranted confidence. Without critical thinking, users risk mistaking fluency for truth.
              </p>
              <p>
                Goodable's approach to AI is explicitly designed to support skepticism, reflection, and inquiry. Our tools encourage users to ask follow-up questions, compare perspectives, and examine assumptions. We do not present AI outputs as final answers, but as starting points for deeper understanding.
              </p>
              <p>
                Critical thinking is especially vital in civic contexts, where policies affect real lives and competing values are often at stake. Democracy requires disagreement, debate, and judgment—not automation. By embedding critical thinking into our platform, we help users remain active participants rather than passive consumers of information.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Coherence: Building Shared Meaning</h2>
              <p>
                The fourth principle is Coherence.
              </p>
              <p>
                In a complex, information-saturated world, the greatest risk is not disagreement—it is fragmentation. When people no longer share a common understanding of facts, processes, or goals, collaboration collapses and trust erodes.
              </p>
              <p>
                Coherence is about maintaining alignment across systems, narratives, and decisions. It ensures that information makes sense not just in isolation, but as part of a larger whole. In civic life, coherence is what allows people with different perspectives to operate within a shared reality, even when they disagree on outcomes.
              </p>
              <p>
                At Goodable, coherence means that our tools speak the same language across contexts. A bill summary aligns with its legislative history. An impact analysis connects to real-world implications. AI explanations are consistent with primary sources and clearly traceable back to them. Nothing exists as a disconnected fragment.
              </p>
              <p>
                Coherence also applies to values. Our use of AI is guided by the same principles everywhere it appears: transparency, accountability, and respect for human judgment. This alignment prevents confusion, manipulation, and the erosion of trust that occurs when systems behave unpredictably or contradict themselves.
              </p>
              <p>
                Where consistency focuses on repetition, coherence focuses on sense-making. It is what allows users to orient themselves, understand where they stand, and engage constructively with others—even in moments of conflict or uncertainty.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Why the 4C Framework Matters</h2>
              <p>
                Taken together, Choice, Clarity, Critical Thinking, and Coherence form more than a framework for AI use—they form a philosophy for democratic technology.
              </p>
              <p>
                They ensure that:
              </p>
              <ul>
                <li>People retain agency over decisions that affect their lives.</li>
                <li>Complex systems become understandable rather than alienating.</li>
                <li>AI supports judgment instead of replacing it.</li>
                <li>Civic engagement is grounded in shared meaning and intelligibility.</li>
              </ul>
              <p>
                This framework guides every feature we build at Goodable. It shapes how we design interfaces, how we train AI models, how we present uncertainty, and how we protect user trust. It is the reason our tools aim to empower citizen legislators rather than manipulate behavior or fragment public discourse.
              </p>
              <p>
                Democracy does not fail because people don't care. It fails when systems become too complex, too opaque, or too disconnected from lived experience. We believe that with the right tools—and the right principles—technology can help reverse that trend.
              </p>
              <p>
                The 4C Framework is our commitment to building AI that serves people, strengthens civic participation, and helps restore a democracy grounded in shared understanding.
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

export default AIFluency;

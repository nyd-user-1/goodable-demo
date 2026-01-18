import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';

const About = () => {
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
              About Goodable.dev
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Empowering citizens to shape the policies that shape their lives.
            </p>
          </div>

          {/* Essay Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">A Different Kind of Technology Company</h2>
              <p>
                Goodable.dev began with a simple observation: the tools we use to participate in democracy haven't kept pace with the complexity of the challenges we face. While technology has transformed how we shop, communicate, and work, the fundamental processes of civic engagement remain largely unchanged from a century ago. Bills are still written in impenetrable legal language. Committee hearings happen during work hours when most people can't attend. The gap between citizens and their representatives grows wider each year.
              </p>
              <p>
                We built Goodable to close that gap. Not by replacing human judgment with algorithms, but by giving people the information and tools they need to engage meaningfully with the legislative process. We believe that when citizens can easily understand what their government is doing, track the issues that matter to them, and connect with others who share their concerns, democracy works better for everyone.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">The Challenge We're Addressing</h2>
              <p>
                For decades, the American middle class has been under pressure. Manufacturing jobs have moved overseas. Healthcare and education costs have skyrocketed. Wages have stagnated while productivity has soared. These aren't abstract policy debates—they're the daily realities that millions of families navigate as they try to build stable, fulfilling lives.
              </p>
              <p>
                The policy responses to these challenges have often fallen short, not because lawmakers don't care, but because the legislative process itself has become disconnected from the people it's meant to serve. Special interests with resources to hire lobbyists and track every bill have an inherent advantage over ordinary citizens who are busy working, raising families, and living their lives.
              </p>
              <p>
                Goodable exists to level that playing field. We provide the same sophisticated tools that professional lobbyists use—bill tracking, legislative analysis, contact management, coalition building—but we make them accessible to everyone. A teacher in Ohio can now follow education funding bills with the same precision as a K Street lobbying firm. A small business owner in Arizona can understand exactly how proposed tax changes would affect their bottom line. A recent graduate in Michigan can track criminal justice reform efforts and know exactly when to make their voice heard.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">AI in Service of Democracy</h2>
              <p>
                Artificial intelligence is transforming every industry, and civic technology is no exception. But we approach AI differently than most companies. We're not interested in using AI to manipulate, persuade, or automate away human decision-making. Instead, we use AI to illuminate—to make complex legislation understandable, to surface connections between bills that might otherwise go unnoticed, to help people find their voice when engaging with their representatives.
              </p>
              <p>
                Our AI systems are built on a foundation we call "constitutional AI for civic engagement." This means our tools are governed by a set of principles that prioritize accuracy, transparency, and the empowerment of citizens. When our AI summarizes a bill, it presents the facts without spin. When it identifies potential impacts, it acknowledges uncertainty and presents multiple perspectives. When it helps someone draft a letter to their representative, it amplifies their voice rather than replacing it.
              </p>
              <p>
                We ask ourselves one central question when building every feature: Does this help restore and grow the American middle class? That might sound ambitious for a technology company, but we believe that giving ordinary people better tools to engage with their government is one of the most direct paths to policies that work for working families.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">What Goodable Does</h2>
              <p>
                At its core, Goodable is a platform that makes legislative information accessible and actionable. We track thousands of bills across state legislatures, providing plain-English summaries, status updates, and impact analyses. Users can set up alerts for issues they care about and receive notifications when relevant legislation moves forward.
              </p>
              <p>
                But tracking bills is just the beginning. Goodable helps users understand the people behind the policies—who their legislators are, how they've voted in the past, who funds their campaigns, and how to contact them effectively. We provide tools for organizing with others who share your concerns, from finding local advocacy groups to coordinating testimony at public hearings.
              </p>
              <p>
                Our AI assistant can answer questions about any bill in our database, explain complex legal language, and help users understand how proposed legislation might affect their lives. It can draft letters, prepare talking points for town halls, and suggest the most effective ways to make your voice heard on any given issue.
              </p>
              <p>
                For those who want to go deeper, Goodable offers policy research tools that were previously available only to professional researchers. Users can trace the history of legislation, understand how similar bills have fared in other states, and access academic research on policy effectiveness. We're building the most comprehensive civic intelligence platform ever created, and we're making it available to everyone.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">The Next Generation of Citizen Legislators</h2>
              <p>
                We believe that the future of American democracy depends on a new generation of engaged citizens who see participation in government not as a burden but as an opportunity. We call these people "citizen legislators"—not because they hold elected office, but because they take ownership of the legislative process in their communities.
              </p>
              <p>
                Citizen legislators come from every background. They're the parent who organizes their school district to advocate for better funding. The small business owner who testifies before the city council about zoning regulations. The retiree who tracks state pension legislation and keeps their former colleagues informed. The college student who registers voters on campus and helps their peers understand what's on the ballot.
              </p>
              <p>
                What unites citizen legislators is a belief that democracy is participatory—that showing up matters, that individual voices can make a difference, and that the health of our republic depends on people taking responsibility for their communities. Goodable exists to support these people, to give them the tools they need to be effective, and to help them find and connect with others who share their commitment.
              </p>
              <p>
                We're particularly focused on making civic engagement accessible to people who have historically been excluded from the political process. This means building tools that work on mobile devices, since many Americans access the internet primarily through their phones. It means providing information in multiple languages and at various reading levels. It means designing for users who may have never contacted their representative before and need guidance on where to start.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Our Approach to Building Technology</h2>
              <p>
                Goodable is built on the belief that technology should serve human values, not the other way around. This shapes everything from how we design our user interface to how we train our AI models to how we structure our company.
              </p>
              <p>
                We prioritize clarity over cleverness. Our interface is designed to be intuitive for first-time users while still being powerful enough for policy professionals. We avoid dark patterns and manipulation—we want users to engage because they find value in our tools, not because we've tricked them into staying.
              </p>
              <p>
                We're committed to accuracy and honesty. Our AI systems are trained to acknowledge uncertainty, present multiple perspectives on contested issues, and clearly distinguish between facts and interpretation. When we make mistakes—and we will—we commit to correcting them quickly and transparently.
              </p>
              <p>
                We protect user privacy. Civic engagement can be sensitive, and users need to trust that their activity on our platform won't be used against them. We collect only the data necessary to provide our services, we don't sell user information, and we give users control over their own data.
              </p>
              <p>
                We build for the long term. The challenges facing American democracy won't be solved overnight, and we're building a company that can sustain this work for decades. This means making responsible business decisions, building a team that shares our values, and maintaining the trust of our users above all else.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Looking Forward</h2>
              <p>
                We're still in the early days of building Goodable, and we have ambitious plans for what comes next. We're expanding our coverage to include more states and eventually the federal government. We're building new tools for coalition organizing and grassroots advocacy. We're developing educational resources to help people understand not just what's happening in their government, but how to effectively participate in it.
              </p>
              <p>
                Most importantly, we're listening to our users. The best ideas for new features come from the citizen legislators who use our platform every day. They tell us what's working, what's missing, and what they need to be more effective advocates for their communities. This feedback shapes our roadmap and keeps us focused on what matters.
              </p>
              <p>
                We believe that the tools we're building can make a real difference in the lives of ordinary Americans. Not by replacing human judgment with algorithms, but by giving people the information and capabilities they need to participate meaningfully in their democracy. When citizens can easily understand what their government is doing, hold their representatives accountable, and work together to advocate for change, policies tend to better reflect the needs of working families.
              </p>
              <p>
                That's the future we're working toward—a democracy that truly represents the people, supported by technology that empowers rather than manipulates, building a country where the middle class can thrive again. It's ambitious, but we believe it's achievable. And we'd love for you to join us.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
              <p>
                Whether you're a seasoned activist or someone who's never contacted their representative, there's a place for you at Goodable. Start by exploring the bills that affect the issues you care about. Set up alerts so you never miss an important vote. Use our AI tools to understand complex legislation and draft effective communications. Connect with others in your community who share your concerns.
              </p>
              <p>
                Democracy is not a spectator sport. The policies that shape our lives—from healthcare to education to economic opportunity—are decided by the people who show up. Goodable is here to help you show up, to give you the tools you need to be heard, and to connect you with a community of citizen legislators who believe that a better future is possible.
              </p>
              <p>
                Welcome to Goodable. Let's build something good together.
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

export default About;

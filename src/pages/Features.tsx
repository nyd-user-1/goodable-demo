import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';

const Features = () => {
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
              Platform Features
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Everything you need to engage with the legislative process, from tracking bills to taking action.
            </p>
          </div>

          {/* Features Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Bill Tracking</h2>
              <p>
                Stay informed on the legislation that matters most to you. Our comprehensive bill tracking system monitors thousands of bills across the New York State Legislature, providing real-time status updates, committee assignments, and voting records. Set up personalized alerts to receive notifications when bills you care about move through the legislative process.
              </p>
              <p>
                Each bill in our database includes plain-English summaries, sponsor information, committee assignments, and complete legislative history. Filter by topic, sponsor, committee, or status to find exactly what you're looking for. Whether you're tracking a single bill or monitoring an entire policy area, our bill tracking tools give you the visibility you need.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Citations</h2>
              <p>
                Build credible arguments with properly sourced information. Our citation system automatically generates accurate references for bills, legislative actions, and official documents. When you're writing to your representative, preparing testimony, or creating advocacy materials, our citation tools ensure your work is backed by authoritative sources.
              </p>
              <p>
                Citations include direct links to official legislative documents, making it easy for others to verify your sources. Export citations in multiple formats for use in reports, letters, or academic research. Never worry about finding the right reference again.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Contracts</h2>
              <p>
                Access and analyze government contracts with unprecedented transparency. Our contracts database provides detailed information on public spending, vendor relationships, and procurement patterns. Understand how tax dollars are being allocated and hold government accountable for spending decisions.
              </p>
              <p>
                Search contracts by agency, vendor, amount, or category. Track spending trends over time and identify patterns that might otherwise go unnoticed. Whether you're a journalist investigating public spending or a citizen interested in how your community's resources are being used, our contracts tools provide the transparency you need.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Excerpts</h2>
              <p>
                Save and organize the most important parts of your research. Our excerpts feature lets you highlight and store key passages from bills, analyses, and documents. Build a personal library of legislative insights that you can reference, share, and use in your advocacy work.
              </p>
              <p>
                Excerpts automatically maintain links to their source documents, so you always know where information came from. Organize excerpts by topic, bill, or project. Share collections with colleagues or coalition partners to keep everyone on the same page.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Letter Generation</h2>
              <p>
                Make your voice heard with professionally crafted correspondence. Our AI-powered letter generation tools help you write effective communications to your elected representatives. Whether you're expressing support, opposition, or requesting a meeting, our templates and writing assistance ensure your message is clear, professional, and impactful.
              </p>
              <p>
                Choose from multiple letter formats including formal correspondence, email templates, and public comment submissions. Our AI can help you articulate your position while maintaining your authentic voice. Letters automatically include relevant bill numbers, committee information, and other details that show you've done your homework.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Live Feed</h2>
              <p>
                Stay current with real-time legislative activity. Our live feed provides instant updates on bill movements, votes, committee actions, and other legislative events as they happen. Never miss an important development again.
              </p>
              <p>
                Customize your feed to focus on the issues, committees, or legislators you care about most. Get instant notifications for time-sensitive actions like upcoming votes or public comment deadlines. The live feed keeps you connected to the legislative process in real-time.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Multi-Engine Chat</h2>
              <p>
                Get intelligent answers to your legislative questions. Our multi-engine chat system combines advanced AI models to provide accurate, comprehensive responses about bills, policies, and the legislative process. Ask questions in plain English and receive clear, well-sourced answers.
              </p>
              <p>
                Choose from multiple AI engines optimized for different types of queries. Whether you need a quick summary, detailed analysis, or help understanding complex legal language, our chat system adapts to your needs. All responses include citations so you can verify information and dig deeper.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Prompt Library</h2>
              <p>
                Accelerate your research with pre-built query templates. Our prompt library contains carefully crafted prompts for common legislative research tasks. Whether you're analyzing a bill's potential impact, comparing legislation across sessions, or researching a legislator's voting history, our prompt library gives you a head start.
              </p>
              <p>
                Browse prompts by category or search for specific topics. Customize prompts to fit your exact needs, then save your favorites for future use. The prompt library is continuously updated based on user feedback and emerging research needs.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Get Started Today</h2>
              <p>
                All of these features are designed to work together, creating a comprehensive platform for civic engagement. Whether you're a professional advocate, a concerned citizen, or someone just beginning to engage with the legislative process, Goodable provides the tools you need to be effective.
              </p>
              <p>
                Start exploring our features today. Track a bill that affects your community. Use our chat to understand a complex piece of legislation. Generate a letter to your representative. Every action you take brings us closer to a democracy that truly represents the people.
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

export default Features;

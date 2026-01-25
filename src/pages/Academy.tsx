import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Link } from 'react-router-dom';

const Academy = () => {
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
              Citizen Legislator's Academy
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Learn to leverage the tools of modern civic engagement and become an effective advocate for your community.
            </p>
          </div>

          {/* Essay Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">What is the Citizen Legislator's Academy?</h2>
              <p>
                The Citizen Legislator's Academy is NYSgpt's educational initiative designed to transform ordinary citizens into effective policy advocates. We believe that everyone has the capacity to shape the policies that affect their lives—they just need the right knowledge, tools, and support to do it effectively.
              </p>
              <p>
                Our curriculum combines practical platform training with deep insights into the legislative process. You'll learn not just how to use NYSgpt's tools, but how to think strategically about advocacy, build coalitions, and make your voice heard at every level of government. Whether you're tracking your first bill or organizing a statewide campaign, the Academy will meet you where you are and help you grow.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Who Is This For?</h2>
              <p>
                The Academy welcomes everyone who wants to participate more effectively in democracy. Our students come from all walks of life:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Community organizers</strong> looking to amplify their impact with better tools and strategies</li>
                <li><strong>Nonprofit staff</strong> who need to track legislation and mobilize supporters quickly</li>
                <li><strong>Concerned parents</strong> advocating for better schools, safer neighborhoods, or family-friendly policies</li>
                <li><strong>Small business owners</strong> navigating regulations and advocating for economic policies</li>
                <li><strong>Students and young people</strong> finding their voice in civic life for the first time</li>
                <li><strong>Retirees</strong> with time to dedicate to causes they've cared about their whole lives</li>
                <li><strong>Anyone</strong> who has ever thought "someone should do something about this" and realized they could be that someone</li>
              </ul>
              <p>
                No prior experience with policy or advocacy is required. We start with the fundamentals and build from there.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
              <p>
                The Academy curriculum is organized around the core skills every citizen legislator needs:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Mastering the Platform</h3>
              <p>
                Learn to use every feature of NYSgpt to its full potential. Track bills that matter to you, set up smart alerts, use AI-powered analysis to understand complex legislation, and organize your advocacy work efficiently. We'll show you how professional lobbyists use these same techniques—and how you can too.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Understanding the Legislative Process</h3>
              <p>
                Demystify how laws are actually made. Learn to read a bill, understand committee structures, identify key decision points, and recognize when and how to intervene effectively. We cover both state and local government processes so you can engage at every level.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Effective Communication</h3>
              <p>
                Craft messages that get results. Learn the difference between constituent contacts that get filed away and those that change minds. Practice writing testimony, preparing for town halls, and communicating with legislative staff. Our AI tools can help draft your communications, but understanding what makes advocacy effective is invaluable.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Building Coalitions</h3>
              <p>
                No one changes policy alone. Learn to identify potential allies, build relationships across difference, coordinate campaigns, and leverage collective power. We'll show you how to use NYSgpt's networking features to find and connect with others who share your concerns.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Strategic Thinking</h3>
              <p>
                Move beyond reactive advocacy to proactive strategy. Learn to set goals, identify leverage points, time your interventions for maximum impact, and measure your success. Understand when to compromise, when to hold firm, and how to play the long game.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Learn from the Best: Guest Speakers</h2>
              <p>
                One of the most valuable parts of the Academy is learning from people who have been in the trenches. Our guest speaker series brings in leaders from nonprofits, advocacy organizations, and mission-driven institutions who share their real-world experiences and hard-won wisdom.
              </p>
              <p>
                Past and upcoming speakers include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Executive directors of statewide advocacy organizations who have won major legislative victories</li>
                <li>Grassroots organizers who have built movements from the ground up</li>
                <li>Former legislative staff who know how decisions really get made</li>
                <li>Policy researchers who can connect you to the evidence base for effective solutions</li>
                <li>Communications experts who have shaped public narratives on critical issues</li>
                <li>Leaders from environmental, economic justice, healthcare, education, and civil rights organizations</li>
              </ul>
              <p>
                These aren't distant lectures—they're interactive sessions where you can ask questions, share challenges, and build relationships with people who are doing this work every day.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Academy Format</h2>
              <p>
                The Academy is designed to fit into busy lives. We offer multiple ways to learn:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Self-Paced Courses</h3>
              <p>
                Work through our comprehensive curriculum on your own schedule. Each module includes video lessons, interactive exercises, and practical assignments that you can complete on the platform. Perfect for those who need flexibility.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Live Workshops</h3>
              <p>
                Join scheduled sessions led by experienced instructors. These small-group workshops allow for real-time questions, peer learning, and hands-on practice. Workshops are recorded for those who can't attend live.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Cohort Programs</h3>
              <p>
                For those seeking deeper engagement, our cohort programs bring together groups of citizen legislators who work through the curriculum together over several weeks. You'll build relationships, hold each other accountable, and often collaborate on shared advocacy goals.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Office Hours</h3>
              <p>
                Get personalized guidance from Academy instructors during regular office hours. Whether you're stuck on a strategy question, need help navigating a specific legislative situation, or just want feedback on your approach, we're here to help.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Real Impact, Real Stories</h2>
              <p>
                The Academy isn't about abstract learning—it's about making a real difference. Our graduates have:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Successfully advocated for local zoning changes that preserved affordable housing</li>
                <li>Organized testimony that helped defeat harmful legislation targeting vulnerable communities</li>
                <li>Built coalitions that secured funding for community health programs</li>
                <li>Trained others in their organizations, multiplying their impact</li>
                <li>Run for local office themselves, taking their advocacy to the next level</li>
              </ul>
              <p>
                These aren't exceptional cases—they're the natural result of giving motivated people the tools and knowledge they need to be effective. Every graduate of the Academy joins a growing network of citizen legislators who support each other and collaborate on shared goals.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Our Partners</h2>
              <p>
                The Academy is developed in partnership with leading nonprofits and mission-driven organizations who share our commitment to empowering citizens. These partnerships ensure our curriculum reflects real-world needs and opens doors for our graduates.
              </p>
              <p>
                Partner organizations contribute guest speakers, help develop curriculum relevant to their issue areas, and often recruit Academy graduates for volunteer and staff positions. If your organization is interested in partnering with the Academy, we'd love to hear from you.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p>
                Ready to become a citizen legislator? Here's how to begin:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li><strong>Create your NYSgpt account</strong> if you haven't already—it's free to start</li>
                <li><strong>Explore the platform</strong> by tracking a bill or researching your representatives</li>
                <li><strong>Enroll in the Academy</strong> through your dashboard to access courses and upcoming events</li>
                <li><strong>Join the community</strong> by introducing yourself in our forums and connecting with fellow citizen legislators</li>
              </ol>
              <p>
                The challenges facing our communities won't solve themselves. But with the right tools, knowledge, and support, ordinary citizens can accomplish extraordinary things. The Citizen Legislator's Academy is here to help you find your power and use it well.
              </p>
              <p>
                <Link to="/auth-2" className="text-primary hover:underline font-medium">Sign up today</Link> and start your journey toward more effective civic engagement. Democracy needs you—and we're here to help you show up.
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

export default Academy;

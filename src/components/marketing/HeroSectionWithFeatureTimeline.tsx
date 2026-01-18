import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function HeroSectionWithFeatureTimeline() {
  const milestones = [
    {
      date: "Q1 2024",
      title: "AI-Powered Code Generation",
      description:
        "Intelligent code suggestions and automated refactoring powered by advanced machine learning models.",
      status: "Released",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <path d="m18.5 5.5-8.5 8.5-4-4" />
          <path d="M18.5 5.5h-4v-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      date: "Q2 2024",
      title: "Real-Time Collaboration",
      description:
        "Multi-user editing, commenting, and version control integration for seamless team workflows.",
      status: "In Progress",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M6 12h12" />
          <path d="M12 6v12" />
        </svg>
      ),
    },
    {
      date: "Q3 2024",
      title: "Advanced Testing Suite",
      description:
        "Automated testing framework with AI-driven test generation and coverage analysis.",
      status: "Planned",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      date: "Q4 2024",
      title: "Enterprise Security Features",
      description:
        "Advanced security controls, audit logging, and compliance reporting for enterprise teams.",
      status: "Planned",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="bg-background">
        <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px] py-24 lg:py-32">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">
                Roadmap
              </Badge>
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                Building the future of development
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Our commitment to innovation drives us forward. See what
                we&apos;re building and what&apos;s coming next.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                  View Full Roadmap
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 h-4 w-4"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
                <Button size="lg" variant="outline">
                  Request Feature
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={milestone.date} className="relative">
                    {/* Timeline line */}
                    {index !== milestones.length - 1 && (
                      <div
                        className={`absolute left-6 top-12 h-full w-0.5 ${
                          milestone.status === "Released"
                            ? "bg-foreground"
                            : milestone.status === "In Progress"
                            ? "bg-gradient-to-b from-foreground to-muted"
                            : "bg-muted"
                        }`}
                      ></div>
                    )}

                    <Card className="relative flex gap-6 p-6 hover:shadow-lg transition-all duration-300">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center bg-muted`}
                      >
                        {milestone.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant={
                              milestone.status === "Released"
                                ? "default"
                                : milestone.status === "In Progress"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              milestone.status === "Released"
                                ? "bg-foreground text-background hover:bg-foreground/90"
                                : ""
                            }
                          >
                            {milestone.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {milestone.date}
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Request CTA */}
            <Card className="mt-16 p-8 text-center max-w-2xl mx-auto bg-muted/50">
              <h3 className="font-semibold mb-2">Have a feature in mind?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We&apos;re always looking to improve. Share your ideas and help
                shape our roadmap.
              </p>
              <Button variant="outline" size="lg">
                Submit Feature Request
              </Button>
            </Card>
          </div>
      </div>
    </>
  );
}

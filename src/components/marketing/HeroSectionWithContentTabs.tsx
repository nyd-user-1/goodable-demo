import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HeroSectionWithContentTabs() {
  const features = [
    {
      id: 'explore',
      title: 'Explore',
      description: 'Complete legislative database',
      content: {
        title: 'Every bill at your fingertips',
        description:
          'Access the full NYS legislative database with live updates. Browse bills by session, view full texts, track status changes, and see committee assignments—all in one place.',
        image: '/goodable-analytics-demo.png',
        stats: [
          { label: 'Active Bills', value: '15K+' },
          { label: 'Sessions', value: '10+' },
          { label: 'Live Updates', value: '24/7' },
        ],
      },
    },
    {
      id: 'research',
      title: 'Research',
      description: 'Legislators & committees',
      content: {
        title: 'Know your representatives',
        description:
          'Detailed profiles for every legislator including party affiliations, districts, voting patterns, and committee memberships. Plus comprehensive committee data with leadership roles and jurisdictions.',
        image: '/legislative%20research.png',
        stats: [
          { label: 'Legislators', value: '213' },
          { label: 'Committees', value: '70+' },
          { label: 'Vote Records', value: '100K+' },
        ],
      },
    },
    {
      id: 'act',
      title: 'Act',
      description: 'Built-in advocacy tools',
      content: {
        title: 'Turn insight into action',
        description:
          'Every bill analysis includes tools to email sponsors directly, generate personalized letters, view official documents, and track your positions. Make your voice heard with one click.',
        image: '/legislative%20research.png',
        stats: [
          { label: 'Email Templates', value: '50+' },
          { label: 'Letter Formats', value: '12' },
          { label: 'Doc Types', value: '8' },
        ],
      },
    },
  ];

  return (
    <>
      {/* Hero */}
      <div className="">
        <div className="relative">
          {/* Background pattern */}
          <div className="absolute inset-0 -z-10 h-full w-full">
            <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(120,119,198,0.1),transparent)]"></div>
          </div>

          <div className="container mx-auto px-4 py-24 md:px-6 lg:py-32 2xl:max-w-[1400px]">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <Badge variant="outline" className="mb-4">
                NYS Legislature API
              </Badge>
              <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Comprehensive legislative intelligence
              </h1>
              <p className="text-muted-foreground mb-8 text-xl">
                Access the complete NYS legislative database with live updates.
                Translate complex policy into actionable insights.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                  Start Exploring
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
                  View Sample Analysis
                </Button>
              </div>
            </div>

            {/* Feature Tabs */}
            <div className="mx-auto max-w-5xl">
              <Tabs defaultValue="explore" className="space-y-8">
                <TabsList className="mx-auto grid h-auto w-full max-w-2xl grid-cols-3 gap-4 bg-transparent">
                  {features.map((feature) => (
                    <TabsTrigger
                      key={feature.id}
                      value={feature.id}
                      className="group bg-muted data-[state=active]:bg-foreground data-[state=active]:text-background h-full rounded-xl"
                    >
                      <div className="p-2 text-left whitespace-normal">
                        <p className="font-semibold">{feature.title}</p>
                        <p className="group-data-[state=active]:text-background/70 text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {features.map((feature) => (
                  <TabsContent key={feature.id} value={feature.id}>
                    <Card className="p-6">
                      <div className="grid items-center gap-8 lg:grid-cols-2">
                        <div>
                          <h2 className="mb-4 text-3xl font-bold">
                            {feature.content.title}
                          </h2>
                          <p className="text-muted-foreground mb-8">
                            {feature.content.description}
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                            {feature.content.stats.map((stat) => (
                              <div key={stat.label}>
                                <p className="text-2xl font-bold">
                                  {stat.value}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  {stat.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="relative">
                          <div className="aspect-[4/3] overflow-hidden rounded-lg">
                            <img
                              src={feature.content.image}
                              alt={feature.title}
                              width={800}
                              height={600}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {/* Floating Elements */}
                          <Card className="absolute -right-4 -bottom-4 w-48 p-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-foreground"
                                >
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                  <path d="m9 12 2 2 4-4" />
                                </svg>
                              </div>
                              <p className="font-medium">Live data</p>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      {/* End Hero */}
    </>
  );
}

import { ChatHeader } from '@/components/ChatHeader';
import { NonprofitAdvocacyTabs } from '@/components/NonprofitAdvocacyTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Nonprofit organizations organized by category (sorted A-Z)
const partnerCategories = [
  {
    category: "Economic Advocacy",
    description: "Economic justice, labor policy, fiscal research, workforce, income, inequality",
    partners: [
      {
        name: "ACT - The Appraisal Foundation",
        tagline: "Policy-related valuation research",
        prompt: "What is ACT - The Appraisal Foundation and how does their valuation research influence economic policy? How can I learn more about their work?"
      },
      {
        name: "AFL-CIO",
        tagline: "Largest U.S. labor federation",
        prompt: "Tell me about the AFL-CIO's role in labor policy advocacy. How can I support their work for workers' rights?"
      },
      {
        name: "AFT (American Federation of Teachers)",
        tagline: "Teachers union and education advocacy",
        prompt: "What is AFT doing to advocate for teachers and education policy? How can I get involved with their campaigns?"
      },
      {
        name: "American Action Forum",
        tagline: "Public policy and economic analysis",
        prompt: "What policy research does the American Action Forum produce? How can I access their economic analysis?"
      },
      {
        name: "Bipartisan Policy Center",
        tagline: "Cross-spectrum economic policy coalition",
        prompt: "How does the Bipartisan Policy Center bring together different perspectives on economic policy? How can I engage with their work?"
      },
      {
        name: "Brookings Institution",
        tagline: "Major public policy research including economy",
        prompt: "Tell me about Brookings Institution's economic research. How can I access their policy analysis and support their mission?"
      },
      {
        name: "Center for American Progress",
        tagline: "Economic and policy research",
        prompt: "What economic policy work does the Center for American Progress focus on? How can I support their research?"
      },
      {
        name: "Center for Economic and Policy Research",
        tagline: "Research on economic justice",
        prompt: "What is the Center for Economic and Policy Research working on? How can I support their economic justice mission?"
      },
      {
        name: "Center for Popular Democracy",
        tagline: "Grassroots organizing meets economic and labor policy",
        prompt: "How does the Center for Popular Democracy combine grassroots organizing with economic policy advocacy? What campaigns are they currently running?"
      },
      {
        name: "Center on Budget and Policy Priorities",
        tagline: "Poverty and budget research",
        prompt: "What research does the Center on Budget and Policy Priorities produce on poverty and fiscal policy? How can I support their work?"
      },
      {
        name: "CLASP",
        tagline: "Economic security, child care, and workforce policy",
        prompt: "Tell me about CLASP's work on economic security and workforce policy. How can I get involved?"
      },
      {
        name: "Economic Policy Institute",
        tagline: "National leader on wages, labor economics, and inequality",
        prompt: "Tell me about the Economic Policy Institute's work on wage policy and labor economics. How can I support their research and advocacy efforts?"
      },
      {
        name: "Fiscal Policy Institute",
        tagline: "NY-focused fiscal policy and tax equity research",
        prompt: "What is the Fiscal Policy Institute and how does their research influence New York State budget and tax policy? How can I get involved?"
      },
      {
        name: "Jobs With Justice",
        tagline: "Worker rights and economic equity campaigns",
        prompt: "What campaigns is Jobs With Justice running for worker rights? How can I join their movement?"
      },
      {
        name: "Levy Economics Institute (Bard College)",
        tagline: "Nonpartisan economic research",
        prompt: "What economic research does the Levy Economics Institute produce? How can I access their work?"
      },
      {
        name: "Make the Road New York",
        tagline: "Immigrant and working-class economic justice advocacy",
        prompt: "How does Make the Road New York advocate for immigrant and working-class communities? How can I support their work?"
      },
      {
        name: "Manhattan Institute",
        tagline: "Market-oriented economic research",
        prompt: "What policy research does the Manhattan Institute focus on? How can I engage with their economic analysis?"
      },
      {
        name: "National Bureau of Economic Research (NBER)",
        tagline: "Data-driven economic research",
        prompt: "What is NBER and how does their research inform economic policy? How can I access their publications?"
      },
      {
        name: "National Employment Law Project",
        tagline: "Worker justice and labor standards advocacy",
        prompt: "What is the National Employment Law Project doing to advance worker rights? How can I support their advocacy?"
      },
      {
        name: "National Skills Coalition",
        tagline: "Workforce and skills policy advocacy",
        prompt: "How does the National Skills Coalition advocate for workforce development? How can I get involved?"
      },
      {
        name: "NYPIRG",
        tagline: "Consumer protection and higher-ed affordability advocacy",
        prompt: "What is NYPIRG's role in New York consumer protection and higher education advocacy? How can students and citizens get involved?"
      },
      {
        name: "Peterson Institute for International Economics",
        tagline: "Global economic policy research",
        prompt: "What global economic research does the Peterson Institute produce? How can I learn from their analysis?"
      },
      {
        name: "Roosevelt Institute",
        tagline: "Reshaping conversations on antitrust and economic democracy",
        prompt: "Tell me about the Roosevelt Institute's work on antitrust policy and economic democracy. How can I support their mission?"
      },
      {
        name: "SEIU",
        tagline: "Service Employees International Union - healthcare and labor advocacy",
        prompt: "What is SEIU doing to advocate for service workers and healthcare? How can I support their campaigns?"
      },
      {
        name: "The Conference Board",
        tagline: "Business research and economic indicators",
        prompt: "What economic indicators and research does The Conference Board provide? How can I access their data?"
      },
      {
        name: "Third Way",
        tagline: "Moderate policy advocacy on economy and governance",
        prompt: "What economic policy positions does Third Way advocate for? How can I engage with their work?"
      },
      {
        name: "Urban Institute",
        tagline: "Inequality, workforce, and fiscal policy research",
        prompt: "What research does the Urban Institute conduct on economic inequality? How can I support their mission?"
      },
    ]
  },
  {
    category: "Environmental Advocacy",
    description: "Climate change, conservation, environmental justice, clean energy, water/air policy",
    partners: [
      {
        name: "350.org",
        tagline: "Climate advocacy and fossil fuel divestment",
        prompt: "What climate campaigns is 350.org running? How can I join their movement for climate action?"
      },
      {
        name: "Audubon Society",
        tagline: "Bird habitat and climate policy",
        prompt: "How does the Audubon Society work to protect birds and their habitats? How can I support their conservation efforts?"
      },
      {
        name: "Chesapeake Bay Foundation",
        tagline: "Watershed management policy",
        prompt: "What is the Chesapeake Bay Foundation doing to protect the Bay? How can I get involved in their conservation work?"
      },
      {
        name: "Citizens Campaign for the Environment (CCE)",
        tagline: "Influential in NYS environmental legislation",
        prompt: "Tell me about Citizens Campaign for the Environment and their impact on New York environmental legislation. How can I volunteer or donate?"
      },
      {
        name: "Citizens' Climate Lobby",
        tagline: "Carbon policy advocacy",
        prompt: "How does Citizens' Climate Lobby advocate for carbon pricing policy? How can I join their grassroots efforts?"
      },
      {
        name: "Clean Water Action",
        tagline: "Water quality policy advocacy",
        prompt: "What is Clean Water Action doing to protect water quality? How can I support their advocacy?"
      },
      {
        name: "Climate Reality Project",
        tagline: "Public climate campaigning",
        prompt: "What campaigns is the Climate Reality Project running? How can I become a climate leader through their programs?"
      },
      {
        name: "Conservation Law Foundation",
        tagline: "Northeast environmental policy",
        prompt: "How does the Conservation Law Foundation protect the environment in the Northeast? How can I support their legal advocacy?"
      },
      {
        name: "Defenders of Wildlife",
        tagline: "Species and habitat policy",
        prompt: "What is Defenders of Wildlife doing to protect endangered species? How can I support their conservation work?"
      },
      {
        name: "Earth Day Network",
        tagline: "Public engagement and policy campaigns",
        prompt: "What environmental campaigns does the Earth Day Network run? How can I participate in Earth Day activities?"
      },
      {
        name: "Earthjustice",
        tagline: "Environmental legal advocacy",
        prompt: "What environmental cases is Earthjustice litigating? How can I support their legal work for the environment?"
      },
      {
        name: "Environmental Advocates NY",
        tagline: "NY clean air/water advocacy",
        prompt: "What is Environmental Advocates NY doing to protect New York's environment? How can I get involved?"
      },
      {
        name: "Environmental Defense Fund (EDF)",
        tagline: "Market-based climate policy and regulatory design",
        prompt: "How does the Environmental Defense Fund approach climate and environmental policy? What are their current priorities and how can I help?"
      },
      {
        name: "Friends of the Earth",
        tagline: "Environmental justice and corporate accountability",
        prompt: "What campaigns is Friends of the Earth running for environmental justice? How can I join their efforts?"
      },
      {
        name: "League of Conservation Voters",
        tagline: "Environmental political advocacy",
        prompt: "How does the League of Conservation Voters hold politicians accountable on the environment? How can I support their work?"
      },
      {
        name: "National Environmental Education Foundation",
        tagline: "Environmental policy and education",
        prompt: "What environmental education programs does NEEF offer? How can I support environmental literacy?"
      },
      {
        name: "National Parks Conservation Association",
        tagline: "Public lands advocacy",
        prompt: "What is the National Parks Conservation Association doing to protect national parks? How can I support their mission?"
      },
      {
        name: "National Wildlife Federation",
        tagline: "Conservation and energy policy",
        prompt: "How does the National Wildlife Federation advocate for wildlife and conservation? How can I get involved?"
      },
      {
        name: "Natural Resources Council of Maine",
        tagline: "Regional environmental policy advocacy",
        prompt: "What environmental issues does the Natural Resources Council of Maine focus on? How can I support their work?"
      },
      {
        name: "Natural Resources Defense Council (NRDC)",
        tagline: "Climate litigation and environmental regulation",
        prompt: "What is NRDC's current work on climate policy and environmental protection? How can I support their legal and advocacy efforts?"
      },
      {
        name: "NYC Environmental Justice Alliance",
        tagline: "NYC coalition on environmental justice issues",
        prompt: "What environmental justice issues is the NYC Environmental Justice Alliance addressing? How can I support their community work?"
      },
      {
        name: "Ocean Conservancy",
        tagline: "Marine policy advocacy",
        prompt: "What is Ocean Conservancy doing to protect our oceans? How can I support marine conservation?"
      },
      {
        name: "Open Space Institute",
        tagline: "Conservation and land-use policy across the Northeast",
        prompt: "How does the Open Space Institute work to protect land and open spaces in New York and the Northeast? How can I contribute to their mission?"
      },
      {
        name: "Sierra Club",
        tagline: "Major grassroots environmental advocacy",
        prompt: "What environmental campaigns is the Sierra Club running? How can I join their grassroots movement?"
      },
      {
        name: "The Nature Conservancy",
        tagline: "Land and climate policy",
        prompt: "How does The Nature Conservancy protect lands and address climate change? How can I support their conservation work?"
      },
      {
        name: "Union of Concerned Scientists",
        tagline: "Science-based advocacy",
        prompt: "What science-based advocacy does the Union of Concerned Scientists do? How can I support their work?"
      },
      {
        name: "WE ACT for Environmental Justice",
        tagline: "Environmental justice and community-driven climate policy",
        prompt: "What is WE ACT for Environmental Justice and how do they advance environmental justice in New York? How can I support their community-driven work?"
      },
    ]
  },
  {
    category: "Social Advocacy",
    description: "Civil rights, human rights, healthcare, housing, education, equity, justice",
    partners: [
      {
        name: "ACLU",
        tagline: "Civil liberties and legal advocacy",
        prompt: "What civil liberties issues is the ACLU currently working on? How can I support their legal advocacy?"
      },
      {
        name: "Asian Americans Advancing Justice",
        tagline: "Policy and civil rights advocacy",
        prompt: "How does Asian Americans Advancing Justice advocate for civil rights? How can I support their work?"
      },
      {
        name: "Black Futures Lab",
        tagline: "Black civic engagement and policy solutions",
        prompt: "What policy solutions is the Black Futures Lab advancing? How can I support Black civic engagement?"
      },
      {
        name: "Children's Defense Fund",
        tagline: "Children's welfare and policy reform",
        prompt: "What is the Children's Defense Fund doing to advocate for children? How can I support their mission?"
      },
      {
        name: "Community Service Society of New York (CSS)",
        tagline: "Historic institution in social welfare and poverty policy",
        prompt: "What is the Community Service Society of New York and how do they address poverty and social welfare? How can I support their work?"
      },
      {
        name: "Equal Justice Initiative",
        tagline: "Criminal justice reform",
        prompt: "What criminal justice reforms is the Equal Justice Initiative advancing? How can I support their work?"
      },
      {
        name: "Families USA",
        tagline: "Health equity advocacy",
        prompt: "How does Families USA advocate for health equity? How can I support their healthcare campaigns?"
      },
      {
        name: "Health Care for All",
        tagline: "National healthcare policy advocacy",
        prompt: "What is Health Care for All doing to advance healthcare access? How can I join their movement?"
      },
      {
        name: "Hispanic Federation",
        tagline: "Latino community policy",
        prompt: "How does the Hispanic Federation support Latino communities through policy? How can I get involved?"
      },
      {
        name: "Human Rights Watch",
        tagline: "Global and U.S. human rights advocacy",
        prompt: "What human rights issues is Human Rights Watch documenting? How can I support their advocacy?"
      },
      {
        name: "Lambda Legal",
        tagline: "LGBTQ+ legal advocacy",
        prompt: "What LGBTQ+ rights cases is Lambda Legal working on? How can I support their legal work?"
      },
      {
        name: "Lawyers' Committee for Civil Rights Under Law",
        tagline: "Legal advocacy for civil rights",
        prompt: "What civil rights cases is the Lawyers' Committee working on? How can I support their legal advocacy?"
      },
      {
        name: "Legal Aid Society",
        tagline: "Legal services and policy advocacy",
        prompt: "How does the Legal Aid Society provide legal services and advocate for policy change? How can I support their work?"
      },
      {
        name: "Make the Road NY",
        tagline: "Immigrant rights and justice",
        prompt: "How does Make the Road NY advocate for immigrant communities? How can I support their campaigns?"
      },
      {
        name: "NAACP",
        tagline: "Civil rights leadership and policy advocacy",
        prompt: "What civil rights issues is the NAACP advocating for? How can I support their mission?"
      },
      {
        name: "National Coalition for the Homeless",
        tagline: "Housing policy advocacy",
        prompt: "What is the National Coalition for the Homeless doing to address homelessness? How can I support their advocacy?"
      },
      {
        name: "National Disability Rights Network",
        tagline: "Disability policy and rights",
        prompt: "How does the National Disability Rights Network advocate for disability rights? How can I support their work?"
      },
      {
        name: "National Organization for Women",
        tagline: "Women's rights advocacy",
        prompt: "What women's rights issues is NOW advocating for? How can I join their campaigns?"
      },
      {
        name: "National Urban League",
        tagline: "Economic and civil rights advocacy",
        prompt: "How does the National Urban League advance economic and civil rights? How can I support their mission?"
      },
      {
        name: "National Women's Law Center",
        tagline: "Gender and economic justice",
        prompt: "What gender justice issues is the National Women's Law Center working on? How can I support their advocacy?"
      },
      {
        name: "New York Civil Liberties Union (NYCLU)",
        tagline: "Shaping policy through litigation and legislation",
        prompt: "What civil liberties issues is the NYCLU currently working on? How can I support their legal and advocacy work in New York?"
      },
      {
        name: "SAGE",
        tagline: "LGBTQ+ elders advocacy",
        prompt: "How does SAGE support LGBTQ+ elders? How can I get involved with their programs?"
      },
      {
        name: "Schott Foundation for Public Education",
        tagline: "Educational equity advocacy",
        prompt: "What is the Schott Foundation doing to advance educational equity? How can I support their work?"
      },
      {
        name: "Southern Poverty Law Center",
        tagline: "Justice and accountability advocacy",
        prompt: "What justice issues is the Southern Poverty Law Center working on? How can I support their legal advocacy?"
      },
      {
        name: "The Century Foundation",
        tagline: "Education, healthcare, immigration, and democracy research",
        prompt: "Tell me about The Century Foundation's research and policy work. What are their current priorities and how can I engage with their mission?"
      },
      {
        name: "UnidosUS",
        tagline: "Latino civil rights advocacy",
        prompt: "How does UnidosUS advocate for Latino civil rights? How can I support their policy work?"
      },
      {
        name: "United Way NYC",
        tagline: "Education, health, and economic mobility programs",
        prompt: "How does United Way NYC work to improve education, health, and economic mobility? What volunteer and giving opportunities exist?"
      },
      {
        name: "Urban League of Westchester County",
        tagline: "NY area social advocacy",
        prompt: "What social issues does the Urban League of Westchester County address? How can I support their community work?"
      },
      {
        name: "Vera Institute of Justice",
        tagline: "Criminal justice reform and research",
        prompt: "What criminal justice reforms is the Vera Institute advancing? How can I support their research and advocacy for a more just system?"
      },
    ]
  },
  {
    category: "Democracy & Governance",
    description: "Elections, transparency, civic engagement, government accountability",
    partners: [
      {
        name: "Asian American Legal Defense Fund",
        tagline: "Legal and civic rights policy",
        prompt: "How does the Asian American Legal Defense Fund protect civil rights? How can I support their work?"
      },
      {
        name: "Brennan Center for Justice",
        tagline: "Leading democracy and election-law think tank",
        prompt: "What is the Brennan Center for Justice working on to protect democracy and voting rights? How can I support their mission?"
      },
      {
        name: "Campaign Legal Center",
        tagline: "Campaign finance and ethics reform",
        prompt: "How does the Campaign Legal Center work to improve campaign finance laws and government ethics? How can I get involved?"
      },
      {
        name: "Center for Election Innovation & Research",
        tagline: "Election policy work",
        prompt: "What election reforms is the Center for Election Innovation & Research advancing? How can I learn more?"
      },
      {
        name: "Center for Responsive Politics",
        tagline: "Campaign finance transparency",
        prompt: "How does the Center for Responsive Politics track money in politics? How can I use their research?"
      },
      {
        name: "Common Cause",
        tagline: "Government accountability and ethics",
        prompt: "What government accountability issues is Common Cause working on? How can I join their campaigns?"
      },
      {
        name: "Common Cause New York",
        tagline: "Redistricting, ethics reform, and voter access",
        prompt: "Tell me about Common Cause New York's work on redistricting and voting access. How can I volunteer or support their campaigns?"
      },
      {
        name: "CUNY Citizenship Now",
        tagline: "Citizenship and civic integration",
        prompt: "How does CUNY Citizenship Now help immigrants become citizens? How can I support their programs?"
      },
      {
        name: "League of Women Voters",
        tagline: "Nonpartisan voter engagement and policy",
        prompt: "What is the League of Women Voters doing to improve elections? How can I join or support their civic engagement work?"
      },
      {
        name: "National Institute on Money in Politics",
        tagline: "Money in politics data",
        prompt: "What data does the National Institute on Money in Politics provide? How can I access their research?"
      },
      {
        name: "National Voter Registration Day",
        tagline: "Civic participation campaigns",
        prompt: "How can I participate in National Voter Registration Day? What resources do they provide?"
      },
      {
        name: "New York Foundation",
        tagline: "Grants for advocacy and civic justice",
        prompt: "How does the New York Foundation support civic advocacy? How can I learn about their grantmaking?"
      },
      {
        name: "NY Immigration Coalition",
        tagline: "Voter and immigrant civic empowerment",
        prompt: "How does the NY Immigration Coalition empower immigrant voters? How can I support their work?"
      },
      {
        name: "NY Progressive Action Network",
        tagline: "Grassroots democratic mobilization",
        prompt: "What grassroots campaigns is the NY Progressive Action Network running? How can I get involved?"
      },
      {
        name: "OpenGov Foundation",
        tagline: "Civic tech for accountability",
        prompt: "What civic technology does the OpenGov Foundation develop? How can I support their work?"
      },
      {
        name: "Public Citizen",
        tagline: "Consumer advocacy and democratic accountability",
        prompt: "What democracy and consumer issues is Public Citizen working on? How can I support their advocacy?"
      },
      {
        name: "Rock the Vote",
        tagline: "Young voter outreach",
        prompt: "How does Rock the Vote engage young voters? How can I participate in their campaigns?"
      },
      {
        name: "Rockefeller Institute of Government",
        tagline: "Research at the intersection of policy and governance",
        prompt: "What research does the Rockefeller Institute of Government conduct on state policy and governance? How can I access their resources and support their work?"
      },
      {
        name: "Sunlight Foundation",
        tagline: "Open data and government transparency",
        prompt: "What government transparency work does the Sunlight Foundation do? How can I support open government?"
      },
      {
        name: "Verified Voting",
        tagline: "Election technology and policy",
        prompt: "How does Verified Voting work to ensure secure elections? How can I support election integrity?"
      },
      {
        name: "Vote.org",
        tagline: "Voter access advocacy",
        prompt: "How does Vote.org help people register and vote? How can I support voter access?"
      },
      {
        name: "Voto Latino",
        tagline: "Youth voting and civic engagement",
        prompt: "How does Voto Latino engage young Latino voters? How can I support their civic engagement work?"
      },
    ]
  }
];

const NonprofitDirectory = () => {
  const navigate = useNavigate();

  const handlePromptClick = (prompt: string) => {
    navigate(`/?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Navigation */}
      <ChatHeader />

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Nonprofit directory
            </h1>

            {/* Tab Navigation */}
            <NonprofitAdvocacyTabs />

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Leading organizations shaping policy across New York and the nation. Learn how to support their work.
            </p>
            <p className="text-muted-foreground">
              Tap a card to learn more about each organization.
            </p>
          </div>

          {/* Partner Categories */}
          {partnerCategories.map((category) => (
            <div key={category.category} className="mb-16">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-foreground text-background hover:bg-foreground/90 px-3 py-1">
                  {category.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{category.description}</p>

              {/* Partner Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.partners.map((partner) => (
                  <div
                    key={partner.name}
                    onClick={() => handlePromptClick(partner.prompt)}
                    className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
                  >
                    <h3 className="font-semibold text-base mb-2">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {partner.tagline}
                    </p>

                    {/* Chat arrow button - renders on hover */}
                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
                      <div className="flex justify-end">
                        <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center">
                          <ArrowUp className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Attribution Section */}
          <div className="mt-20 pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
              These organizations represent some of the most influential voices in policy advocacy across New York State and the nation. We encourage you to explore their work, support their missions, and engage with the causes that matter to you.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default NonprofitDirectory;

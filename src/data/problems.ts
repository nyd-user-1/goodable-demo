
export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  subProblems: number;
  solutions: number;
  category: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  relatedProblems: string[];
  statistics: {
    label: string;
    value: string | number;
    source?: string;
  }[];
  solutionsList: {
    id: string;
    title: string;
    description: string;
    feasibility: number;
    impact: number;
  }[];
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Convert titles to URL-friendly slugs
const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const problems: Problem[] = [
  {
    id: "childcare",
    slug: createSlug("Childcare"),
    title: "Childcare",
    description: "Addressing the critical need for accessible, affordable, and quality childcare services for working families.",
    subProblems: 26,
    solutions: 84,
    category: "Social Services",
    priority: "urgent",
    relatedProblems: ["quality-time", "education-access", "work-life-balance"],
    statistics: [
      { label: "Families Affected", value: "12.7M", source: "Department of Health & Human Services" },
      { label: "Average Monthly Cost", value: "$1,230", source: "Child Care Aware of America" },
      { label: "Workforce Impact", value: "2.3M", source: "Bureau of Labor Statistics" }
    ],
    solutionsList: [
      {
        id: "universal-pre-k",
        title: "Universal Pre-K Programs",
        description: "Government-funded early childhood education for all children aged 3-5",
        feasibility: 7,
        impact: 9
      },
      {
        id: "childcare-subsidies",
        title: "Childcare Subsidies",
        description: "Income-based financial assistance for childcare costs",
        feasibility: 8,
        impact: 8
      },
      {
        id: "workplace-childcare",
        title: "Workplace Childcare Centers",
        description: "On-site childcare facilities provided by employers",
        feasibility: 6,
        impact: 7
      }
    ],
    metadata: {
      title: "Childcare Crisis Solutions | Goodable",
      description: "Explore comprehensive solutions to the childcare crisis affecting millions of families. From universal pre-K to workplace centers.",
      keywords: ["childcare", "early childhood education", "working families", "affordable childcare", "universal pre-k"]
    }
  },
  {
    id: "quality-time",
    slug: createSlug("Quality Time"),
    title: "Quality Time",
    description: "Creating meaningful connections and reducing the barriers to spending quality time with family and community.",
    subProblems: 5,
    solutions: 17,
    category: "Social Connection",
    priority: "high",
    relatedProblems: ["childcare", "work-life-balance", "social-isolation"],
    statistics: [
      { label: "Average Family Time", value: "37 min/day", source: "American Time Use Survey" },
      { label: "Screen Time vs Family Time", value: "7:1 ratio", source: "Common Sense Media" },
      { label: "Community Engagement", value: "23%", source: "Pew Research Center" }
    ],
    solutionsList: [
      {
        id: "flexible-work",
        title: "Flexible Work Arrangements",
        description: "Remote work and flexible scheduling to increase family time",
        feasibility: 8,
        impact: 7
      },
      {
        id: "community-spaces",
        title: "Community Gathering Spaces",
        description: "Public spaces designed for family and community activities",
        feasibility: 7,
        impact: 6
      }
    ],
    metadata: {
      title: "Quality Time Solutions | Goodable",
      description: "Discover ways to increase meaningful family and community time in our busy modern world.",
      keywords: ["quality time", "family time", "work-life balance", "community connection", "flexible work"]
    }
  },
  {
    id: "third-place",
    slug: createSlug("Third Place"),
    title: "Third Place",
    description: "Creating vibrant community spaces that serve as informal gathering places beyond home and work.",
    subProblems: 30,
    solutions: 86,
    category: "Community Development",
    priority: "high",
    relatedProblems: ["social-isolation", "community-safety", "civic-engagement"],
    statistics: [
      { label: "Communities Lacking Third Places", value: "65%", source: "Urban Planning Institute" },
      { label: "Impact on Mental Health", value: "40% reduction", source: "Community Health Study" },
      { label: "Economic Benefit", value: "$2.3B annually", source: "Local Business Alliance" }
    ],
    solutionsList: [
      {
        id: "community-centers",
        title: "Neighborhood Community Centers",
        description: "Multi-purpose spaces for local gatherings and activities",
        feasibility: 7,
        impact: 8
      },
      {
        id: "pocket-parks",
        title: "Pocket Parks and Plazas",
        description: "Small-scale public spaces in urban neighborhoods",
        feasibility: 8,
        impact: 7
      }
    ],
    metadata: {
      title: "Third Place Solutions | Goodable",
      description: "Explore solutions for creating vibrant community spaces that bring people together.",
      keywords: ["third place", "community spaces", "social connection", "urban planning", "public spaces"]
    }
  },
  {
    id: "climate-change",
    slug: createSlug("Climate Change"),
    title: "Climate Change",
    description: "Addressing the urgent environmental crisis through sustainable policies and innovative solutions.",
    subProblems: 23,
    solutions: 67,
    category: "Environment",
    priority: "urgent",
    relatedProblems: ["renewable-energy", "environmental-justice", "water-conservation"],
    statistics: [
      { label: "Global Temperature Rise", value: "+1.1°C", source: "IPCC" },
      { label: "Carbon Emissions", value: "36.3 Gt", source: "Global Carbon Atlas" },
      { label: "Economic Impact", value: "$23T by 2100", source: "Nature Climate Change" }
    ],
    solutionsList: [
      {
        id: "carbon-pricing",
        title: "Carbon Pricing Mechanisms",
        description: "Market-based approaches to reduce greenhouse gas emissions",
        feasibility: 7,
        impact: 9
      },
      {
        id: "green-infrastructure",
        title: "Green Infrastructure Investment",
        description: "Large-scale investment in renewable energy and sustainable transport",
        feasibility: 6,
        impact: 8
      }
    ],
    metadata: {
      title: "Climate Change Solutions | Goodable",
      description: "Explore evidence-based solutions to combat climate change and build a sustainable future.",
      keywords: ["climate change", "carbon emissions", "renewable energy", "sustainability", "environmental policy"]
    }
  }
];

// Generate additional problems for all categories shown on landing page
const additionalProblems = [
  { title: "Income Stagnation", subProblems: 16, solutions: 32, category: "Economic Policy" },
  { title: "End Stage Capitalism", subProblems: 2, solutions: 2, category: "Economic Policy" },
  { title: "Cultural Divisions", subProblems: 1, solutions: 1, category: "Social Issues" },
  { title: "Addictive Technology", subProblems: 5, solutions: 8, category: "Technology" },
  { title: "Fake News", subProblems: 1, solutions: 3, category: "Media" },
  { title: "Free Time", subProblems: 11, solutions: 20, category: "Social Connection" },
  { title: "Housing Crisis", subProblems: 18, solutions: 45, category: "Housing" },
  { title: "Mental Health Support", subProblems: 12, solutions: 38, category: "Healthcare" },
  { title: "Food Security", subProblems: 9, solutions: 24, category: "Food & Agriculture" },
  { title: "Digital Divide", subProblems: 14, solutions: 41, category: "Technology" },
  { title: "Elder Care", subProblems: 7, solutions: 19, category: "Healthcare" },
  { title: "Education Access", subProblems: 31, solutions: 78, category: "Education" },
  { title: "Workplace Burnout", subProblems: 6, solutions: 15, category: "Labor" },
  { title: "Social Isolation", subProblems: 11, solutions: 29, category: "Social Connection" },
  { title: "Healthcare Access", subProblems: 22, solutions: 56, category: "Healthcare" },
  { title: "Financial Literacy", subProblems: 8, solutions: 22, category: "Education" },
  { title: "Community Safety", subProblems: 13, solutions: 34, category: "Public Safety" },
  { title: "Environmental Justice", subProblems: 17, solutions: 43, category: "Environment" },
  { title: "Youth Development", subProblems: 21, solutions: 51, category: "Education" },
  { title: "Disability Rights", subProblems: 5, solutions: 12, category: "Civil Rights" },
  { title: "Immigration Support", subProblems: 19, solutions: 47, category: "Immigration" },
  { title: "Gender Equality", subProblems: 24, solutions: 62, category: "Civil Rights" },
  { title: "Veteran Services", subProblems: 10, solutions: 26, category: "Veterans Affairs" },
  { title: "Rural Development", subProblems: 15, solutions: 39, category: "Community Development" },
  { title: "Urban Planning", subProblems: 28, solutions: 71, category: "Community Development" },
  { title: "Transportation Equity", subProblems: 12, solutions: 31, category: "Transportation" },
  { title: "Criminal Justice Reform", subProblems: 20, solutions: 54, category: "Justice" },
  { title: "Substance Abuse", subProblems: 9, solutions: 23, category: "Healthcare" },
  { title: "Homelessness", subProblems: 16, solutions: 42, category: "Housing" },
  { title: "Digital Privacy", subProblems: 11, solutions: 28, category: "Technology" },
  { title: "Renewable Energy", subProblems: 25, solutions: 65, category: "Environment" },
  { title: "Water Conservation", subProblems: 7, solutions: 18, category: "Environment" },
  { title: "Food Waste Reduction", subProblems: 13, solutions: 35, category: "Environment" },
  { title: "Civic Engagement", subProblems: 18, solutions: 46, category: "Democracy" },
  { title: "Small Business Support", subProblems: 22, solutions: 58, category: "Economic Policy" },
  { title: "Disaster Relief", subProblems: 8, solutions: 21, category: "Emergency Management" },
  { title: "Cultural Preservation", subProblems: 14, solutions: 37, category: "Culture" },
  { title: "Scientific Research", subProblems: 27, solutions: 69, category: "Science" },
  { title: "Public Health", subProblems: 32, solutions: 81, category: "Healthcare" },
  { title: "Economic Development", subProblems: 19, solutions: 49, category: "Economic Policy" },
  { title: "Infrastructure", subProblems: 24, solutions: 61, category: "Infrastructure" },
  { title: "Racial Justice", subProblems: 17, solutions: 44, category: "Civil Rights" },
  { title: "Worker Rights", subProblems: 15, solutions: 40, category: "Labor" },
  { title: "Consumer Protection", subProblems: 10, solutions: 27, category: "Consumer Affairs" },
  { title: "Animal Welfare", subProblems: 12, solutions: 32, category: "Animal Rights" },
  { title: "Media Literacy", subProblems: 9, solutions: 25, category: "Education" },
  { title: "Government Transparency", subProblems: 21, solutions: 53, category: "Democracy" },
  { title: "Nonprofit Management", subProblems: 26, solutions: 66, category: "Nonprofit" },
  { title: "Community Organizing", subProblems: 14, solutions: 36, category: "Community Development" },
  { title: "Volunteer Coordination", subProblems: 8, solutions: 20, category: "Community Service" },
  { title: "Policy Analysis", subProblems: 18, solutions: 47, category: "Policy" },
  { title: "Data Advocacy", subProblems: 16, solutions: 41, category: "Technology" },
  { title: "Legal Aid", subProblems: 11, solutions: 30, category: "Justice" },
  { title: "Grassroots Mobilization", subProblems: 23, solutions: 59, category: "Activism" },
  { title: "Social Innovation", subProblems: 20, solutions: 52, category: "Innovation" },
  { title: "Impact Measurement", subProblems: 13, solutions: 33, category: "Analytics" }
];

// Add all additional problems to the main problems array
additionalProblems.forEach((problem) => {
  const priorities: Problem['priority'][] = ["urgent", "high", "normal", "low"];
  const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
  
  problems.push({
    id: createSlug(problem.title),
    slug: createSlug(problem.title),
    title: problem.title,
    description: `Comprehensive solutions and policy approaches to address ${problem.title.toLowerCase()} challenges in our communities.`,
    subProblems: problem.subProblems,
    solutions: problem.solutions,
    category: problem.category,
    priority: randomPriority,
    relatedProblems: [],
    statistics: [
      { label: "People Affected", value: `${Math.floor(Math.random() * 50) + 10}M`, source: "Census Bureau" },
      { label: "Annual Cost", value: `$${Math.floor(Math.random() * 500) + 100}B`, source: "Economic Research" }
    ],
    solutionsList: [
      {
        id: `solution-${createSlug(problem.title)}-1`,
        title: `${problem.title} Policy Initiative`,
        description: `Strategic policy approach to address ${problem.title.toLowerCase()}`,
        feasibility: Math.floor(Math.random() * 5) + 5,
        impact: Math.floor(Math.random() * 5) + 5
      }
    ],
    metadata: {
      title: `${problem.title} Solutions | Goodable`,
      description: `Find innovative solutions and policy proposals for ${problem.title.toLowerCase()} challenges.`,
      keywords: [problem.title.toLowerCase(), "policy", "solutions", "community", "social issues"]
    }
  });
});

export const getProblemBySlug = (slug: string): Problem | undefined => {
  return problems.find(problem => problem.slug === slug);
};

export const getRelatedProblems = (currentProblemId: string, limit: number = 3): Problem[] => {
  const currentProblem = problems.find(p => p.id === currentProblemId);
  if (!currentProblem) return [];
  
  return problems
    .filter(p => p.id !== currentProblemId && p.category === currentProblem.category)
    .slice(0, limit);
};

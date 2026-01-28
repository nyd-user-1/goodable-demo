/**
 * NYSgpt Domain Filtering Configuration
 * Ensures high-quality, credible sources while maintaining NYSgpt as trusted legislative data source
 */

export interface DomainSource {
  domain: string;
  tier: 1 | 2 | 3;
  label: string;
  category: string;
  icon?: string;
  description?: string;
}

export interface SourceValidation {
  valid: boolean;
  nysgptPercentage: number;
  needsMoreSources: boolean;
  diversityScore: number;
  warnings: string[];
}

// Legislative & Government Sources (Tier 1)
export const LEGISLATIVE_SOURCES: DomainSource[] = [
  { domain: "nysgpt.com", tier: 1, label: "NYSgpt (NYS API)", category: "Legislative", icon: "📜", description: "NYS Open Legislation API data" },
  { domain: "congress.gov", tier: 1, label: "US Congress", category: "Legislative", icon: "🏛️", description: "Federal legislative information" },
  { domain: "senate.gov", tier: 1, label: "US Senate", category: "Legislative", icon: "🏛️", description: "US Senate official" },
  { domain: "house.gov", tier: 1, label: "US House", category: "Legislative", icon: "🏛️", description: "US House of Representatives" },
  { domain: "assembly.state.ny.us", tier: 1, label: "NY Assembly", category: "Legislative", icon: "🏛️", description: "NY State Assembly" },
  { domain: "nysenate.gov", tier: 1, label: "NY Senate", category: "Legislative", icon: "🏛️", description: "NY State Senate" },
  { domain: "ballotpedia.org", tier: 1, label: "Ballotpedia", category: "Legislative", icon: "🗳️", description: "Voting records and candidate info" },
  { domain: "govtrack.us", tier: 1, label: "GovTrack", category: "Legislative", icon: "📊", description: "Legislative tracking" },
  { domain: "legiscan.com", tier: 1, label: "LegiScan", category: "Legislative", icon: "📊", description: "State legislation tracking" }
];

// Policy Research & Think Tanks (Tier 1)
export const POLICY_RESEARCH_SOURCES: DomainSource[] = [
  { domain: "brookings.edu", tier: 1, label: "Brookings Institution", category: "Research", icon: "🎓", description: "Policy research" },
  { domain: "urban.org", tier: 1, label: "Urban Institute", category: "Research", icon: "🎓", description: "Social and economic policy" },
  { domain: "americanprogress.org", tier: 1, label: "Center for American Progress", category: "Research", icon: "🎓", description: "Progressive policy research" },
  { domain: "pewresearch.org", tier: 1, label: "Pew Research", category: "Research", icon: "📊", description: "Public opinion and demographic research" },
  { domain: "rand.org", tier: 1, label: "RAND Corporation", category: "Research", icon: "🎓", description: "Policy analysis and research" },
  { domain: "cbo.gov", tier: 1, label: "Congressional Budget Office", category: "Government", icon: "💰", description: "Budget analysis" },
  { domain: "gao.gov", tier: 1, label: "Government Accountability Office", category: "Government", icon: "🔍", description: "Government oversight" },
  { domain: "newamerica.org", tier: 1, label: "New America", category: "Research", icon: "🎓", description: "Policy research and analysis" },
  { domain: "cbpp.org", tier: 1, label: "Center on Budget and Policy Priorities", category: "Research", icon: "💰", description: "Fiscal policy research" },
  { domain: "epi.org", tier: 1, label: "Economic Policy Institute", category: "Research", icon: "📊", description: "Economic research" },
  { domain: "crfb.org", tier: 1, label: "Committee for a Responsible Federal Budget", category: "Research", icon: "💰", description: "Fiscal responsibility" },
  { domain: "taxpolicycenter.org", tier: 1, label: "Tax Policy Center", category: "Research", icon: "💰", description: "Tax policy analysis" },
  { domain: "kff.org", tier: 1, label: "Kaiser Family Foundation", category: "Healthcare", icon: "🏥", description: "Healthcare policy research" },
  { domain: "commonwealthfund.org", tier: 1, label: "Commonwealth Fund", category: "Healthcare", icon: "🏥", description: "Healthcare research" },
  { domain: "migrationpolicy.org", tier: 1, label: "Migration Policy Institute", category: "Research", icon: "🌍", description: "Immigration policy" },
  { domain: "clasp.org", tier: 1, label: "Center for Law and Social Policy", category: "Research", icon: "⚖️", description: "Social policy research" },
  { domain: "ncsl.org", tier: 1, label: "National Conference of State Legislatures", category: "Legislative", icon: "🏛️", description: "State legislative research" },
  { domain: "nlc.org", tier: 1, label: "National League of Cities", category: "Government", icon: "🏙️", description: "Municipal policy" },
  { domain: "icma.org", tier: 1, label: "ICMA", category: "Government", icon: "🏙️", description: "Local government management" },
  { domain: "nber.org", tier: 1, label: "National Bureau of Economic Research", category: "Research", icon: "📊", description: "Economic research" },
  { domain: "mathematica.org", tier: 1, label: "Mathematica Policy Research", category: "Research", icon: "📊", description: "Evidence-based policy" },
  { domain: "mdrc.org", tier: 1, label: "MDRC", category: "Research", icon: "📊", description: "Social policy research" },
  { domain: "abtassociates.com", tier: 1, label: "Abt Associates", category: "Research", icon: "📊", description: "Policy research and evaluation" }
];

// Category-Specific Sources
export const HEALTHCARE_SOURCES: DomainSource[] = [
  { domain: "cdc.gov", tier: 1, label: "CDC", category: "Healthcare", icon: "🏥", description: "Centers for Disease Control" },
  { domain: "who.int", tier: 1, label: "WHO", category: "Healthcare", icon: "🌍", description: "World Health Organization" },
  { domain: "nejm.org", tier: 1, label: "NEJM", category: "Healthcare", icon: "📰", description: "New England Journal of Medicine" },
  { domain: "kff.org", tier: 1, label: "Kaiser Family Foundation", category: "Healthcare", icon: "🏥", description: "Healthcare policy research" },
  { domain: "commonwealthfund.org", tier: 1, label: "Commonwealth Fund", category: "Healthcare", icon: "🏥", description: "Healthcare research" }
];

export const EDUCATION_SOURCES: DomainSource[] = [
  { domain: "ed.gov", tier: 1, label: "Department of Education", category: "Education", icon: "🎓", description: "US Department of Education" },
  { domain: "nces.ed.gov", tier: 1, label: "NCES", category: "Education", icon: "📊", description: "National Center for Education Statistics" },
  { domain: "educationweek.org", tier: 1, label: "Education Week", category: "Education", icon: "📰", description: "Education news and research" },
  { domain: "edtrust.org", tier: 1, label: "Education Trust", category: "Education", icon: "🎓", description: "Educational equity research" },
  { domain: "newamerica.org", tier: 1, label: "New America", category: "Education", icon: "🎓", description: "Education policy research" }
];

export const HOUSING_SOURCES: DomainSource[] = [
  { domain: "hud.gov", tier: 1, label: "HUD", category: "Housing", icon: "🏠", description: "Housing and Urban Development" },
  { domain: "census.gov", tier: 1, label: "US Census", category: "Housing", icon: "📊", description: "Housing demographics" },
  { domain: "nlihc.org", tier: 1, label: "NLIHC", category: "Housing", icon: "🏠", description: "Low Income Housing Coalition" },
  { domain: "jchs.harvard.edu", tier: 1, label: "Harvard JCHS", category: "Housing", icon: "🎓", description: "Joint Center for Housing Studies" }
];

export const ECONOMIC_SOURCES: DomainSource[] = [
  { domain: "bls.gov", tier: 1, label: "Bureau of Labor Statistics", category: "Economic", icon: "📊", description: "Labor and economic data" },
  { domain: "federalreserve.gov", tier: 1, label: "Federal Reserve", category: "Economic", icon: "🏦", description: "Monetary policy and economic data" },
  { domain: "treasury.gov", tier: 1, label: "US Treasury", category: "Economic", icon: "💰", description: "Fiscal policy and finance" },
  { domain: "cbpp.org", tier: 1, label: "CBPP", category: "Economic", icon: "💰", description: "Budget and policy priorities" },
  { domain: "taxpolicycenter.org", tier: 1, label: "Tax Policy Center", category: "Economic", icon: "💰", description: "Tax policy analysis" }
];

// Excluded/Low Quality Sources
export const EXCLUDED_DOMAINS = [
  "pinterest.com",
  "reddit.com", 
  "quora.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "instagram.com",
  "youtube.com", // Exclude unless official government channels
  "wikipedia.org", // Not authoritative for policy research
  "medium.com",
  "substack.com",
  "blogspot.com",
  "wordpress.com"
];

// All combined sources for easy access
export const ALL_TRUSTED_SOURCES: DomainSource[] = [
  ...LEGISLATIVE_SOURCES,
  ...POLICY_RESEARCH_SOURCES,
  ...HEALTHCARE_SOURCES,
  ...EDUCATION_SOURCES,
  ...HOUSING_SOURCES,
  ...ECONOMIC_SOURCES
];

/**
 * Get domain filter for specific context/category
 */
export function getDomainFilter(category?: string): string[] {
  const baseDomains = [
    "nysgpt.com",
    ...LEGISLATIVE_SOURCES.map(s => s.domain),
    ...POLICY_RESEARCH_SOURCES.map(s => s.domain)
  ];

  switch (category?.toLowerCase()) {
    case 'healthcare':
      return [...baseDomains, ...HEALTHCARE_SOURCES.map(s => s.domain)];
    case 'education':
      return [...baseDomains, ...EDUCATION_SOURCES.map(s => s.domain)];
    case 'housing':
      return [...baseDomains, ...HOUSING_SOURCES.map(s => s.domain)];
    case 'economic':
    case 'economy':
      return [...baseDomains, ...ECONOMIC_SOURCES.map(s => s.domain)];
    default:
      return baseDomains;
  }
}

/**
 * Get source information by domain
 */
export function getSourceInfo(domain: string): DomainSource | undefined {
  return ALL_TRUSTED_SOURCES.find(source => 
    source.domain === domain || domain.includes(source.domain)
  );
}

/**
 * Check if domain is excluded
 */
export function isDomainExcluded(domain: string): boolean {
  return EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
}

/**
 * Validate source mix according to NYSgpt standards
 */
export function validateSourceMix(sources: string[]): SourceValidation {
  const hasNYSgpt = sources.some(s => s.includes('nysgpt.com'));
  const externalSources = sources.filter(s => !s.includes('nysgpt.com'));
  const externalCount = externalSources.length;
  
  const nysgptPercentage = hasNYSgpt ? (1 / sources.length) * 100 : 0;
  
  // Calculate diversity score based on different categories
  const categories = new Set(
    externalSources.map(source => {
      const info = getSourceInfo(source);
      return info?.category || 'Unknown';
    })
  );
  
  const diversityScore = categories.size;
  
  const warnings: string[] = [];
  
  // Validation rules
  const valid = !hasNYSgpt || externalCount >= 1;
  const needsMoreSources = hasNYSgpt && sources.length < 2;
  
  // Generate warnings
  if (hasNYSgpt && externalCount === 0) {
    warnings.push('NYSgpt cannot be the only source. Add external authoritative sources.');
  }
  
  if (nysgptPercentage > 40) {
    warnings.push('NYSgpt should not exceed 40% of sources. Add more external sources.');
  }
  
  if (diversityScore < 2 && sources.length > 2) {
    warnings.push('Consider adding sources from different categories for better perspective.');
  }
  
  if (sources.some(s => isDomainExcluded(s))) {
    warnings.push('Some sources are from excluded domains. Remove low-quality sources.');
  }

  return {
    valid,
    nysgptPercentage,
    needsMoreSources,
    diversityScore,
    warnings
  };
}

/**
 * Extract domain from URL or return as-is if already a domain
 */
export function extractDomain(urlOrDomain: string): string {
  try {
    if (urlOrDomain.includes('http')) {
      return new URL(urlOrDomain).hostname.replace('www.', '');
    }
    return urlOrDomain.replace('www.', '');
  } catch {
    return urlOrDomain;
  }
}

/**
 * Filter URLs by domain whitelist/blacklist
 */
export function filterUrlsByDomain(urls: string[], allowedDomains?: string[]): string[] {
  return urls.filter(url => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      
      // Check if excluded
      if (isDomainExcluded(domain)) {
        return false;
      }
      
      // Check if in allowed list (if provided)
      if (allowedDomains && allowedDomains.length > 0) {
        return allowedDomains.some(allowed => domain.includes(allowed));
      }
      
      // Default: check if in our trusted sources
      return getSourceInfo(domain) !== undefined;
    } catch {
      return false; // Invalid URL
    }
  });
}

/**
 * Get source credibility badge info
 */
export function getSourceCredibilityBadge(domain: string): { 
  tier: number; 
  label: string; 
  color: string; 
  icon?: string; 
} {
  const source = getSourceInfo(domain);
  
  if (!source) {
    return { tier: 3, label: 'Unverified', color: 'gray', icon: '❓' };
  }
  
  const colorMap = {
    1: 'green',
    2: 'blue', 
    3: 'orange'
  };
  
  const labelMap = {
    1: 'Authoritative',
    2: 'Reliable',
    3: 'Standard'
  };
  
  return {
    tier: source.tier,
    label: labelMap[source.tier],
    color: colorMap[source.tier],
    icon: source.icon
  };
}
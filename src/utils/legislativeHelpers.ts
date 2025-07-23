// Helper function to detect legislative category from content
export const detectLegislativeCategory = (idea: string): 'technology' | 'environment' | 'tax' | 'social services' | 'labor' | 'human rights' | 'digital rights' | 'education' => {
  const lowerIdea = idea.toLowerCase();
  
  // Define category keywords
  const categoryMap = {
    'technology': ['tech', 'software', 'algorithm', 'ai', 'artificial intelligence', 'cyber', 'digital', 'computer', 'internet', 'platform'],
    'environment': ['environment', 'climate', 'pollution', 'carbon', 'emissions', 'renewable', 'energy', 'conservation', 'wildlife'],
    'tax': ['tax', 'revenue', 'fiscal', 'budget', 'income', 'corporate', 'sales tax', 'property tax', 'irs'],
    'social services': ['welfare', 'benefits', 'assistance', 'healthcare', 'medicare', 'medicaid', 'social security', 'food stamps'],
    'labor': ['employment', 'worker', 'workplace', 'wage', 'union', 'overtime', 'safety', 'discrimination', 'job'],
    'human rights': ['discrimination', 'civil rights', 'equality', 'freedom', 'liberty', 'constitution', 'amendment', 'voting'],
    'digital rights': ['privacy', 'data protection', 'surveillance', 'online', 'internet freedom', 'encryption', 'digital privacy'],
    'education': ['school', 'student', 'teacher', 'education', 'university', 'college', 'learning', 'curriculum', 'tuition']
  };
  
  // Special case mappings for common terms
  if (lowerIdea.includes('childcare') || lowerIdea.includes('child care') || lowerIdea.includes('daycare')) {
    return 'social services';
  }
  
  if (lowerIdea.includes('housing') || lowerIdea.includes('rent') || lowerIdea.includes('homeless')) {
    return 'social services';
  }
  
  // Score each category based on keyword matches
  const scores = Object.entries(categoryMap).map(([category, keywords]) => {
    const matches = keywords.filter(keyword => lowerIdea.includes(keyword)).length;
    return { category, score: matches };
  });
  
  // Get the highest scoring category
  const bestMatch = scores.reduce((max, current) => 
    current.score > max.score ? current : max
  );
  
  // Default to social services if no strong match found
  return bestMatch.score > 0 ? bestMatch.category as any : 'social services';
};

export const extractTitleFromIdea = (idea: string): string => {
  const words = idea.split(' ').slice(0, 8).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1) + " Act";
};

export const generateLegislativeDraft = (idea: string, type: string): string => {
  const title = extractTitleFromIdea(idea) || `Sample ${type}`;
  const date = new Date().getFullYear();
  
  return `${type.toUpperCase()} NO. [NUMBER]

${title.toUpperCase()}

${type === 'Bill' ? `A BILL` : type === 'Resolution' ? `A RESOLUTION` : `AN AMENDMENT`}

To ${idea.split('.')[0].toLowerCase()}.

Be it enacted by the Legislature:

SECTION 1. SHORT TITLE.
This Act may be cited as the "${title}."

SECTION 2. FINDINGS AND PURPOSE.
The Legislature finds that:
(1) [Finding based on the legislative idea]
(2) Current law is insufficient to address these concerns
(3) Legislative action is necessary to protect the public interest

SECTION 3. DEFINITIONS.
For purposes of this Act:
(1) "Agency" means the relevant state agency responsible for implementation
(2) [Additional definitions as needed]

SECTION 4. [OPERATIVE PROVISIONS]
(a) [Primary provision based on legislative idea]
(b) The responsible agency shall:
    (1) Develop implementing regulations within 180 days
    (2) Establish enforcement procedures
    (3) Report annually to the Legislature on implementation

SECTION 5. ENFORCEMENT.
(a) Violations of this Act shall be subject to [appropriate penalties]
(b) The agency may impose administrative sanctions including [specific sanctions]

SECTION 6. FUNDING.
Implementation of this Act shall be funded through [funding mechanism to be determined]

SECTION 7. EFFECTIVE DATE.
This Act shall take effect on January 1, ${date + 1}.

SECTION 8. SEVERABILITY.
If any provision of this Act is held invalid, the remainder shall not be affected.

---
LEGISLATIVE HISTORY:
Introduced: [Date]
Committee: [Committee Assignment]
Status: Draft

FISCAL NOTE:
Estimated cost: [To be determined]
Revenue impact: [To be determined]`;
};
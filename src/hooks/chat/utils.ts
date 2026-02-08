import { validateSourceMix, getSourceInfo, isDomainExcluded, extractDomain } from '@/config/domainFilters';

// Generate sequential problem number
export const generateProblemNumber = (count: number): string => {
  return `P${String(count + 1).padStart(5, '0')}`;
};

// Generate sequential media kit number
export const generateMediaKitNumber = (count: number): string => {
  return `MK${String(count + 1).padStart(5, '0')}`;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getTitle = (entity: any, entityType: 'bill' | 'member' | 'committee' | 'problem' | 'solution' | 'mediaKit' | null) => {
  if (entityType === 'bill' && entity?.bill_number) {
    return `Analysis: ${entity.bill_number}`;
  }
  if (entityType === 'member' && entity?.name) {
    return `Member: ${entity.name}`;
  }
  if (entityType === 'committee' && entity?.name) {
    return `Committee: ${entity.name}`;
  }
  if (entityType === 'problem' && entity?.problemNumber) {
    return `Problem: ${entity.problemNumber}`;
  }
  if (entityType === 'solution' && entity?.problemNumber) {
    return `Solution: ${entity.problemNumber}`;
  }
  if (entityType === 'mediaKit' && entity?.mediaKitNumber) {
    return `Media Kit: ${entity.mediaKitNumber}`;
  }
  return 'AI Assistant';
};

export const getBillChamber = (billNumber: string): string => {
  if (!billNumber) return '';
  const upperBillNumber = billNumber.toUpperCase();
  if (upperBillNumber.startsWith('S')) return 'Senate';
  if (upperBillNumber.startsWith('A')) return 'Assembly';
  return '';
};

// Parse problem chat current_state to extract messages
export const parseProblemChatState = (currentState: string, problemStatement: string, createdAt: string, updatedAt: string): Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: string}> => {
  try {
    // If current_state is a JSON string (array of messages), parse it
    if (typeof currentState === 'string' && currentState.startsWith('[')) {
      const parsedMessages = JSON.parse(currentState);
      if (Array.isArray(parsedMessages)) {
        return parsedMessages.map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString()
        }));
      }
    }
    
    // If current_state is just the AI response string, create the conversation
    const messages: Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: string}> = [
      {
        id: 'user-problem',
        role: 'user',
        content: problemStatement,
        timestamp: createdAt
      }
    ];

    // Add AI response if it exists and is not a draft state
    if (currentState && 
        currentState !== 'draft' && 
        currentState !== 'generating' &&
        !currentState.startsWith('[')) {
      messages.push({
        id: 'ai-analysis',
        role: 'assistant',
        content: currentState,
        timestamp: updatedAt
      });
    }

    return messages;
  } catch (error) {
    // Fallback to just the problem statement
    return [
      {
        id: 'user-problem',
        role: 'user',
        content: problemStatement,
        timestamp: createdAt
      }
    ];
  }
};

// Extract and validate citations from AI response
export const extractCitationsFromResponse = (content: string): {
  citations: Array<{id: string, type: string, title: string, url?: string, credibility?: any}>;
  validation: any;
  warnings: string[];
} => {
  const citations: Array<{id: string, type: string, title: string, url?: string, credibility?: any}> = [];
  const warnings: string[] = [];
  
  // Extract URLs from content
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  const urls = content.match(urlRegex) || [];
  
  // Extract mentions of known sources
  const sourceRegex = /(nysgpt\.com|congress\.gov|nysenate\.gov|brookings\.edu|urban\.org|cbo\.gov|gao\.gov|kff\.org|pewresearch\.org)/gi;
  const mentionedSources = content.match(sourceRegex) || [];
  
  // Combine URLs and mentions
  const allSources = [...new Set([...urls, ...mentionedSources])];
  
  allSources.forEach((source, index) => {
    try {
      const domain = source.includes('http') ? new URL(source).hostname.replace('www.', '') : source;
      const sourceInfo = getSourceInfo(domain);
      
      if (isDomainExcluded(domain)) {
        warnings.push(`Excluded source detected: ${domain}`);
        return;
      }
      
      citations.push({
        id: `citation-${index}`,
        type: sourceInfo?.category || 'Unknown',
        title: sourceInfo?.label || domain,
        url: source.includes('http') ? source : undefined,
        credibility: sourceInfo ? {
          tier: sourceInfo.tier,
          category: sourceInfo.category,
          icon: sourceInfo.icon
        } : undefined
      });
    } catch (error) {
      console.warn('Failed to parse source:', source);
    }
  });
  
  // Validate source mix
  const sourceDomains = citations.map(c => c.url || c.title).filter(Boolean);
  const validation = validateSourceMix(sourceDomains);
  
  // Add validation warnings
  warnings.push(...validation.warnings);
  
  return {
    citations,
    validation,
    warnings
  };
};

// Check if response meets quality standards
export const validateResponseQuality = (content: string): {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  const { citations, validation, warnings } = extractCitationsFromResponse(content);
  
  // Check source requirements
  if (!validation.valid) {
    issues.push('Source validation failed');
    score -= 30;
  }
  
  if (validation.nysgptPercentage > 40) {
    issues.push('Too much reliance on NYSgpt data');
    suggestions.push('Add more external authoritative sources');
    score -= 20;
  }
  
  if (validation.diversityScore < 2 && citations.length > 1) {
    issues.push('Limited source diversity');
    suggestions.push('Include sources from different categories');
    score -= 15;
  }
  
  // Check content quality indicators
  if (content.length < 200) {
    issues.push('Response too brief');
    score -= 10;
  }
  
  if (warnings.length > 0) {
    issues.push(`${warnings.length} source warning(s)`);
    score -= warnings.length * 5;
  }
  
  const isValid = score >= 70 && validation.valid;
  
  return {
    isValid,
    score: Math.max(0, score),
    issues,
    suggestions
  };
};
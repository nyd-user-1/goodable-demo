import { SearchResult } from "@/types/search";

// Common name variations and nicknames
export const nameVariations: Record<string, string[]> = {
  'jose': ['joseph'],
  'joe': ['joseph'],
  'jos': ['joseph'],
  'joey': ['joseph'],
  'mike': ['michael'],
  'bill': ['william'],
  'will': ['william'],
  'bob': ['robert'],
  'rob': ['robert'],
  'rick': ['richard'],
  'dick': ['richard'],
  'jim': ['james'],
  'jimmy': ['james'],
  'tom': ['thomas'],
  'tommy': ['thomas'],
  'dan': ['daniel'],
  'danny': ['daniel'],
  'dave': ['david'],
  'chris': ['christopher'],
  'matt': ['matthew'],
  'tony': ['anthony'],
  'nick': ['nicholas'],
  'alex': ['alexander']
};

export const filterSearchResults = (
  allContent: SearchResult[], 
  searchTerm: string
): SearchResult[] => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase();
  console.log('Search term:', term);
  console.log('All content count:', allContent.length);
  console.log('Members in content:', allContent.filter(item => item.type === 'member').length);
  
  // Log some member names to see what we have
  const members = allContent.filter(item => item.type === 'member');
  console.log('Sample member names:', members.slice(0, 10).map(m => m.title));
  
  // Check if we have Joseph Addabbo specifically
  const josephAddabbo = members.find(m => m.title.toLowerCase().includes('joseph') && m.title.toLowerCase().includes('addabbo'));
  console.log('Found Joseph Addabbo:', josephAddabbo?.title);

  const results = allContent.filter(item => {
    const title = item.title.toLowerCase();
    const content = item.content.toLowerCase();
    
    // Direct substring match
    if (title.includes(term) || content.includes(term)) {
      console.log('Direct match found:', title);
      return true;
    }
    
    // Check name variations for member searches
    if (item.type === 'member') {
      // Check if search term is a nickname
      if (nameVariations[term]) {
        console.log('Checking nickname variations for:', term, nameVariations[term]);
        for (const variation of nameVariations[term]) {
          if (title.includes(variation) || content.includes(variation)) {
            console.log('Nickname match found:', title, 'for variation:', variation);
            return true;
          }
        }
      }
      
      // Check word boundaries for better name matching
      const searchWords = term.split(' ').filter(word => word.length > 0);
      const titleWords = title.split(' ').filter(word => word.length > 0);
      
      // If any search word matches the beginning of any title word
      for (const searchWord of searchWords) {
        for (const titleWord of titleWords) {
          if (titleWord.startsWith(searchWord) || searchWord.startsWith(titleWord)) {
            console.log('Word boundary match found:', title);
            return true;
          }
        }
      }
    }
    
    return false;
  });
  
  console.log('Search results:', results.map(r => r.title));
  return results.slice(0, 10); // Limit to 10 results
};
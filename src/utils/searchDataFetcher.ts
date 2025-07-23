import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";

export const fetchAllSearchContent = async (): Promise<SearchResult[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch user content (requires auth)
    let problems, ideas, drafts, media;
    if (user) {
      // Fetch problem statements
      const problemsResult = await supabase
        .from('problem_statements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      problems = problemsResult.data;

      // Fetch ideas
      const ideasResult = await supabase
        .from('legislative_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      ideas = ideasResult.data;

      // Fetch drafts
      const draftsResult = await supabase
        .from('legislative_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      drafts = draftsResult.data;

      // Fetch media outputs
      const mediaResult = await supabase
        .from('media_outputs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      media = mediaResult.data;
    }

    // Fetch public legislative data (no auth required)
    const { data: bills } = await supabase
      .from('Bills')
      .select('*')
      .limit(500)
      .order('bill_id', { ascending: false });

    const { data: members } = await supabase
      .from('People')
      .select('*')
      .limit(1000) // Increased to include more members like Joseph Addabbo
      .order('people_id', { ascending: false });

    console.log('Raw members data:', members?.length);
    console.log('First 5 members:', members?.slice(0, 5).map(m => ({ id: m.people_id, name: m.name, first_name: m.first_name, last_name: m.last_name })));
    console.log('Joseph Addabbo search:', members?.find(m => 
      m.name?.toLowerCase().includes('addabbo') || 
      (m.first_name?.toLowerCase().includes('joseph') && m.last_name?.toLowerCase().includes('addabbo'))
    ));

    const { data: committees } = await supabase
      .from('Committees')
      .select('*')
      .limit(200)
      .order('committee_id', { ascending: false });

    const allResults: SearchResult[] = [
      // User content
      ...(problems?.map(p => ({
        id: p.id,
        title: p.title,
        type: 'problem' as const,
        content: p.description,
        created_at: p.created_at,
        url: `/problems?id=${p.id}`
      })) || []),
      ...(ideas?.map(i => ({
        id: i.id,
        title: i.title,
        type: 'idea' as const,
        content: i.improved_idea || i.original_idea,
        created_at: i.created_at,
        url: `/ideas?id=${i.id}`
      })) || []),
      ...(drafts?.map(d => ({
        id: d.id,
        title: d.title,
        type: 'draft' as const,
        content: d.draft_content,
        created_at: d.created_at,
        url: `/?id=${d.id}`
      })) || []),
      ...(media?.map(m => ({
        id: m.id,
        title: m.title,
        type: 'media' as const,
        content: m.content,
        created_at: m.created_at,
        url: `/media-kits?id=${m.id}`
      })) || []),
      // Legislative data
      ...(bills?.map(b => ({
        id: b.bill_id.toString(),
        title: b.title || b.bill_number || 'Untitled Bill',
        type: 'bill' as const,
        content: b.description || b.last_action || '',
        created_at: b.status_date || new Date().toISOString(),
        url: `/bills?selected=${b.bill_id}`
      })) || []),
      ...(members?.map(m => ({
        id: m.people_id.toString(),
        title: m.name || `${m.first_name} ${m.last_name}`.trim() || 'Unknown Member',
        type: 'member' as const,
        content: `${m.party || ''} ${m.chamber || ''} ${m.district || ''}`.trim() || m.bio_short || '',
        created_at: new Date().toISOString(),
        url: `/members?selected=${m.people_id}`
      })) || []),
      ...(committees?.map(c => ({
        id: c.committee_id.toString(),
        title: c.committee_name || 'Untitled Committee',
        type: 'committee' as const,
        content: c.description || c.chair_name || '',
        created_at: new Date().toISOString(),
        url: `/committees?selected=${c.committee_id}`
      })) || [])
    ];

    return allResults;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};
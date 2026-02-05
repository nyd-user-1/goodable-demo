import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { ArrowUp, FileText } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function decodeEntities(str: string): string {
  if (typeof document === 'undefined') return str;
  const textarea = document.createElement('textarea');
  let decoded = str;
  let prev = '';
  while (decoded !== prev) {
    prev = decoded;
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }
  return decoded;
}

function getDomainFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Favicon overrides
// ---------------------------------------------------------------------------
const SUPABASE_FAVICON_BASE = 'https://kwyjohornlgujoqypyvu.supabase.co/storage/v1/object/public/Favicons';
const LOCAL_FAVICONS: Record<string, string> = {
  'www.islandharvest.org': `${SUPABASE_FAVICON_BASE}/island-harvest.avif`,
  'islandharvest.org': `${SUPABASE_FAVICON_BASE}/island-harvest.avif`,
};

// ---------------------------------------------------------------------------
// Seed chat counts (descending per column, varied 1-80)
// ---------------------------------------------------------------------------
const featSeed = [69, 61, 52, 44, 38, 31, 24, 18, 12, 6];
const newsSeed = [74, 65, 58, 51, 43, 37, 29, 22, 16, 11, 9, 7, 5, 4, 3, 2, 2, 1, 1, 1];
const userSeed = [78, 68, 59, 49, 42, 34, 27, 21, 14, 8];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Conversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newsVisible, setNewsVisible] = useState(10);

  // -----------------------------------------------------------------------
  // Supabase: prompt chat counts
  // -----------------------------------------------------------------------
  const { data: chatCounts } = useQuery({
    queryKey: ['prompt-chat-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('prompt_chat_counts')
        .select('prompt_id, chat_count');
      if (!data) return {};
      const map: Record<string, number> = {};
      data.forEach((row: any) => {
        map[row.prompt_id] = row.chat_count;
      });
      return map;
    },
    staleTime: 30 * 1000,
  });

  // -----------------------------------------------------------------------
  // Supabase: submitted community prompts
  // -----------------------------------------------------------------------
  const { data: submittedPrompts } = useQuery({
    queryKey: ['submitted-prompts-hub'],
    queryFn: async () => {
      const { data } = await (supabase.from as any)('submitted_prompts')
        .select('id, title, prompt, url, category, featured, created_at, avatar_url, user_generated, show_in_news, show_in_trending, display_name')
        .order('created_at', { ascending: false });
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  const getChatCount = (id: string, fallback: number) =>
    chatCounts?.[id] ?? fallback;

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  const handlePromptClick = (promptId: string, seedCount: number, prompt: string, context?: string) => {
    supabase.rpc('increment_prompt_chat_count', {
      p_prompt_id: promptId,
      p_seed_count: seedCount,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['prompt-chat-counts'] });
    });

    const url = context
      ? `/?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}`
      : `/?prompt=${encodeURIComponent(prompt)}`;
    navigate(url);
  };

  // -----------------------------------------------------------------------
  // Row renderer
  // -----------------------------------------------------------------------
  const renderSubmittedRow = (p: any, baseChatCount = 0) => {
    const domain = getDomainFromUrl(p.url || '');
    const promptText = p.prompt || `Summarize '${p.title}'`;
    const context = p.url ? `fetchUrl:${p.url}` : undefined;
    const chats = getChatCount(p.id, 0) + baseChatCount;
    const dateStr = p.created_at
      ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    const faviconSrc = domain
      ? (LOCAL_FAVICONS[domain] || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`)
      : null;
    return (
      <div key={p.id} className="py-3 first:pt-0">
        <div
          onClick={() => handlePromptClick(p.id, 0, promptText, context)}
          className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border border-transparent hover:border-border"
        >
          <p className="font-semibold text-sm line-clamp-2">{decodeEntities(p.title)}</p>
          <div className="flex items-center gap-2 mt-1">
            {p.display_name && <span className="text-xs font-medium text-muted-foreground">{p.display_name}</span>}
            <span className="text-xs text-muted-foreground">{dateStr || 'Community'}</span>
            {chats > 0 && <span className="text-xs text-blue-500">{chats} chats</span>}
          </div>
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center gap-2">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="h-7 rounded-lg object-cover border border-border/50" />
              ) : faviconSrc ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <img src={faviconSrc} alt="" className="h-7 rounded-lg object-cover border border-border/50 hover:shadow-md transition-all" />
                </a>
              ) : (
                <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ArrowUp className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Derived lists
  // -----------------------------------------------------------------------
  const newsItems = (submittedPrompts || []).filter((p: any) => p.show_in_news);
  const featuredItems = [...(submittedPrompts || [])]
    .filter((p: any) => p.show_in_trending)
    .sort((a: any, b: any) => getChatCount(b.id, 0) - getChatCount(a.id, 0));
  const userItems = (submittedPrompts || []).filter((p: any) => p.user_generated);

  const visibleNews = newsItems.slice(0, newsVisible);
  const hasMoreNews = newsItems.length > newsVisible;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-[120px] pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {(submittedPrompts || []).length > 0 && (
          <div className="pb-12">
            <div className="flex gap-6">
              {/* ------ Featured (left sidebar, sticky) ------ */}
              <aside className="hidden lg:block w-[340px] flex-shrink-0 border-r-2 border-dotted border-border/80 pr-6">
                <div className="sticky top-24">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    Featured
                  </h3>
                  <div className="divide-y-2 divide-dotted divide-border/80">
                    {featuredItems
                      .slice(0, 10)
                      .map((p: any, idx: number) => renderSubmittedRow(p, featSeed[idx] || 4))}
                  </div>
                </div>
              </aside>

              {/* ------ News (center, scrollable with load more) ------ */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  News
                </h3>
                <div className="divide-y-2 divide-dotted divide-border/80">
                  {visibleNews.map((p: any, idx: number) => renderSubmittedRow(p, newsSeed[idx] || 1))}
                </div>
                {hasMoreNews && (
                  <div className="flex justify-center py-8">
                    <button
                      onClick={() => setNewsVisible((prev) => prev + 10)}
                      className="rounded-lg border border-border bg-muted/30 px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 hover:shadow-lg transition-all"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>

              {/* ------ User Generated (right sidebar, sticky) ------ */}
              <aside className="hidden xl:block w-[340px] flex-shrink-0 border-l-2 border-dotted border-border/80 pl-6">
                <div className="sticky top-24">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    User Generated
                  </h3>
                  <div className="divide-y-2 divide-dotted divide-border/80">
                    {userItems.length > 0
                      ? userItems.slice(0, 10).map((p: any, idx: number) => renderSubmittedRow(p, userSeed[idx] || 3))
                      : <p className="text-sm text-muted-foreground py-4">User generated prompts coming soon.</p>
                    }
                  </div>
                </div>
              </aside>
            </div>
          </div>
          )}
        </div>
      </main>

      <FooterSimple />
    </div>
  );
}

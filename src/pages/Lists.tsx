import { useNavigate } from 'react-router-dom';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { ArrowUp, Users, FileText, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const budgetItems = [
  { name: 'Health', amount: '$96.7B', change: '+4.1%', share: '38.3%' },
  { name: 'Social Welfare', amount: '$42.3B', change: '+5.3%', share: '16.8%' },
  { name: 'Education', amount: '$37.8B', change: '+3.2%', share: '15.0%' },
  { name: 'Capital Projects', amount: '$15.7B', change: '+6.2%', share: '6.2%' },
  { name: 'Transportation', amount: '$14.2B', change: '+2.8%', share: '5.6%' },
  { name: 'Mental Hygiene', amount: '$12.9B', change: '+3.7%', share: '5.1%' },
  { name: 'General Government', amount: '$11.4B', change: '+2.1%', share: '4.5%' },
  { name: 'Higher Education', amount: '$9.4B', change: '+1.8%', share: '3.7%' },
  { name: 'Debt Service', amount: '$8.6B', change: '+0.9%', share: '3.4%' },
  { name: 'Public Safety', amount: '$8.1B', change: '+1.9%', share: '3.2%' },
  { name: 'Local Gov Assistance', amount: '$7.3B', change: '+2.4%', share: '2.9%' },
  { name: 'Economic Development', amount: '$6.8B', change: '+3.5%', share: '2.7%' },
  { name: 'Environment & Parks', amount: '$5.2B', change: '+4.6%', share: '2.1%' },
  { name: 'All Other', amount: '$3.9B', change: '+1.2%', share: '1.5%' },
];

export default function Lists() {
  const navigate = useNavigate();

  const { data: recentBills } = useQuery({
    queryKey: ['prompt-hub-bills'],
    queryFn: async () => {
      const { data } = await supabase
        .from('Bills')
        .select('bill_id, bill_number, title, status_desc')
        .order('bill_id', { ascending: false })
        .limit(7);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: topMembers } = useQuery({
    queryKey: ['prompt-hub-members'],
    queryFn: async () => {
      const { data: sponsors } = await supabase
        .from('Sponsors')
        .select('people_id')
        .limit(10000);

      if (!sponsors) return [];

      const counts: Record<number, number> = {};
      sponsors.forEach((s: any) => {
        counts[s.people_id] = (counts[s.people_id] || 0) + 1;
      });

      const topIds = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 14)
        .map(([id]) => parseInt(id));

      const { data: members } = await supabase
        .from('People')
        .select('people_id, name, first_name, last_name, party, chamber, photo_url')
        .in('people_id', topIds);

      if (!members) return [];

      return members
        .map((m: any) => ({ ...m, billCount: counts[m.people_id] || 0 }))
        .sort((a: any, b: any) => b.billCount - a.billCount);
    },
    staleTime: 10 * 60 * 1000,
  });

  const makeMemberSlug = (m: any): string => {
    const raw = m.name || `${m.first_name || ''} ${m.last_name || ''}`;
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((p: string) => p.length > 1)
      .join('-');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-[120px] pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div id="lists" className="pt-0 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* ------ Top Sponsors (members by bills sponsored) ------ */}
              <div className="md:border-r-2 md:border-dotted md:border-border/80 md:pr-6 pb-8 md:pb-0">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Top Sponsors
                </h3>
                <div className="divide-y-2 divide-dotted divide-border/80">
                  {(topMembers || []).map((m: any) => (
                    <div key={m.people_id} className="py-3 first:pt-0">
                      <Link
                        to={`/members/${makeMemberSlug(m)}`}
                        className="group flex items-center gap-3 py-2 hover:bg-muted/30 hover:shadow-md px-4 rounded-lg transition-all duration-200"
                      >
                        {m.photo_url ? (
                          <img
                            src={m.photo_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.party} · {m.chamber}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const prompt = `Tell me about ${m.name} and their legislative record`;
                            navigate(`/?prompt=${encodeURIComponent(prompt)}`);
                          }}
                          className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={`Ask about ${m.name}`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {m.billCount} bills
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* ------ Recent Bills ------ */}
              <div className="md:border-r-2 md:border-dotted md:border-border/80 md:px-6 border-t-2 border-dotted border-border/80 md:border-t-0 pt-8 md:pt-0 pb-8 md:pb-0">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Recent Bills
                </h3>
                <div className="divide-y-2 divide-dotted divide-border/80">
                  {(recentBills || []).map((bill: any) => (
                    <div key={bill.bill_id} className="py-3 first:pt-0">
                      <div
                        className="group py-3 hover:bg-muted/30 hover:shadow-md px-4 rounded-lg transition-all duration-200"
                      >
                        <Link to={`/bills/${bill.bill_number}`} className="block">
                          <p className="font-semibold text-sm">{bill.bill_number}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {bill.title}
                          </p>
                          {bill.status_desc && (
                            <p className="text-xs text-muted-foreground/70 mt-1.5">
                              {bill.status_desc}
                            </p>
                          )}
                        </Link>
                        <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => {
                              const prompt = `Tell me about bill ${bill.bill_number}: ${bill.title || ''}`;
                              navigate(`/?prompt=${encodeURIComponent(prompt)}`);
                            }}
                            className="w-9 h-9 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Ask about this bill"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ------ Budget Explorer ------ */}
              <div className="md:pl-6 border-t-2 border-dotted border-border/80 md:border-t-0 pt-8 md:pt-0">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Budget Explorer
                </h3>
                <div className="divide-y-2 divide-dotted divide-border/80">
                  {budgetItems.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0">
                      <Link
                        to="/budget-dashboard"
                        className="group flex items-center justify-between py-2 hover:bg-muted/30 hover:shadow-md px-4 rounded-lg transition-all duration-200"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.share} of total
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const prompt = `Tell me about New York State's ${item.name} budget category and its ${item.amount} allocation`;
                              navigate(`/?prompt=${encodeURIComponent(prompt)}`);
                            }}
                            className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={`Ask about ${item.name} budget`}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <div className="text-right">
                            <p className="font-medium text-sm">{item.amount}</p>
                            <p className="text-xs text-emerald-600">{item.change}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  );
}

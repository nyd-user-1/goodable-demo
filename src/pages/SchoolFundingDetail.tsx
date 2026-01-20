import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Plus, ExternalLink, Command, GraduationCap, MapPin, Calendar, DollarSign, TrendingUp, TrendingDown, Hash } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { SchoolFundingTotals, SchoolFunding } from "@/types/schoolFunding";
import { formatCurrency, formatPercent } from "@/hooks/useSchoolFundingSearch";

const SchoolFundingDetail = () => {
  const navigate = useNavigate();
  const { fundingId } = useParams<{ fundingId: string }>();
  const [fundingChats, setFundingChats] = useState<Array<{ id: string; title: string; created_at: string }>>([]);

  // Fetch school funding totals data
  const { data: funding, isLoading, error } = useQuery({
    queryKey: ['school-funding-totals', fundingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_funding_totals')
        .select('*')
        .eq('id', fundingId)
        .single();

      if (error) throw error;
      return data as SchoolFundingTotals;
    },
    enabled: !!fundingId,
  });

  // Fetch detailed breakdown by aid category from raw school_funding table
  const { data: categories } = useQuery({
    queryKey: ['school-funding-categories', funding?.district, funding?.enacted_budget],
    queryFn: async () => {
      if (!funding) return [];

      const { data, error } = await supabase
        .from('school_funding')
        .select('*')
        .eq('District', funding.district)
        .ilike('School Year', `%${funding.enacted_budget}%`);

      if (error) throw error;
      return data as SchoolFunding[];
    },
    enabled: !!funding,
  });

  // Fetch school-funding related chats
  useEffect(() => {
    const fetchFundingChats = async () => {
      if (!funding) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Search for chats that mention this district or school funding
        const { data, error } = await supabase
          .from("chat_sessions")
          .select("id, title, created_at")
          .eq("user_id", user.id)
          .or(`title.ilike.%${funding.district}%,title.ilike.%school funding%,title.ilike.%school aid%`)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setFundingChats(data);
        }
      } catch (error) {
        console.error("Error fetching funding chats:", error);
      }
    };

    fetchFundingChats();
  }, [funding]);

  const formatNoteDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleNewChat = async () => {
    if (!funding) return;
    const initialPrompt = `Tell me about school funding for ${funding.district} in ${funding.county || 'New York'} County for the ${funding.enacted_budget} budget year. The total funding change is ${formatCurrency(funding.total_change)} (${formatPercent(funding.percent_change)}). What should I know about this district's funding?`;
    navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
  };

  const handleBack = () => {
    navigate('/school-funding');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !funding) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={handleBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to School Funding
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">School funding record not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isPositiveChange = funding.total_change >= 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Section */}
        <div className="pb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to School Funding</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle theme
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                      ctrlKey: true,
                      bubbles: true
                    });
                    document.dispatchEvent(event);
                  }}
                >
                  <Command className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Command menu
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* School Funding Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-6 relative">
              {/* Header with Icon */}
              <div className="pb-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                      {funding.district}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {funding.county && `${funding.county} County`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1">Budget Year</div>
                  <div className="font-semibold">{funding.enacted_budget}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1">Total Change</div>
                  <div className={`font-semibold flex items-center gap-1 ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {formatCurrency(funding.total_change)}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1">Percent Change</div>
                  <div className={`font-semibold ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPercent(funding.percent_change)}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1">Aid Categories</div>
                  <div className="font-semibold">{funding.category_count}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Base Year Total */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <DollarSign className="h-4 w-4" />
                      <span>Base Year Total</span>
                    </div>
                    <div className="text-muted-foreground ml-6">
                      {formatCurrency(funding.total_base_year)}
                    </div>
                  </div>

                  {/* School Year Total */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <DollarSign className="h-4 w-4" />
                      <span>School Year Total</span>
                    </div>
                    <div className="text-muted-foreground ml-6">
                      {formatCurrency(funding.total_school_year)}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* County */}
                  {funding.county && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <MapPin className="h-4 w-4" />
                        <span>County</span>
                      </div>
                      <div className="text-muted-foreground ml-6">
                        {funding.county}
                      </div>
                    </div>
                  )}

                  {/* Budget Year */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Calendar className="h-4 w-4" />
                      <span>Enacted Budget</span>
                    </div>
                    <div className="text-muted-foreground ml-6">
                      {funding.enacted_budget}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aid Categories Breakdown */}
        {categories && categories.length > 0 && (
          <Card className="bg-card rounded-xl shadow-sm border">
            <CardHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-semibold">
                    Aid Categories Breakdown
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {categories.map((category, index) => {
                  const change = parseFloat(category.Change || '0');
                  const pctChange = parseFloat(category['% Change'] || '0');
                  const isPositive = change >= 0;

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{category['Aid Category'] || 'Unknown Category'}</div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div className={`font-semibold text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(change)}
                        </div>
                        <div className={`text-xs ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* School Funding Chats Section */}
        <Card className="bg-card rounded-xl shadow-sm border">
          <CardHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Related Chats
                </CardTitle>
                {fundingChats.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {fundingChats.length} {fundingChats.length === 1 ? 'chat' : 'chats'}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {fundingChats.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                <span className="text-muted-foreground italic">No chats yet. Start a conversation about this district's funding.</span>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {fundingChats.map((chat) => (
                  <AccordionItem key={chat.id} value={chat.id} className="border-b last:border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-xs text-muted-foreground">
                          {formatNoteDate(chat.created_at)}
                        </span>
                        <span className="text-sm truncate max-w-[300px]">
                          {chat.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/c/${chat.id}`)}
                          className="gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open Chat
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolFundingDetail;

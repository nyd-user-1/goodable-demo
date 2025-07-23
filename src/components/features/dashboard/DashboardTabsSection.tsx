
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { BillsTableDesktop } from "./BillsTableDesktop";
import { BillsTableMobile } from "./BillsTableMobile";
import { ProblemsTable } from "./ProblemsTable";
import { SolutionsTable } from "./SolutionsTable";
import { MediaTable } from "./MediaTable";
import { AllItemsTable } from "./AllItemsTable";
import { useFavorites } from "@/hooks/useFavorites";
import { AIChatSheet } from "@/components/AIChatSheet";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface DashboardTabsSectionProps {
  bills: Bill[];
}

export const DashboardTabsSection = ({ bills }: DashboardTabsSectionProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<Bill | null>(null);
  const [billsWithAIChat, setBillsWithAIChat] = useState<Set<number>>(new Set());
  const [problems, setProblems] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { favoriteBillIds, toggleFavorite } = useFavorites();

  // Fetch bills that have AI chat sessions
  useEffect(() => {
    const fetchBillsWithAIChat = async () => {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("bill_id")
          .not("bill_id", "is", null);

        if (sessions) {
          const billIdsWithChat = new Set(
            sessions.map(session => session.bill_id).filter(Boolean)
          );
          setBillsWithAIChat(billIdsWithChat);
        }
      } catch (error) {
      }
    };

    fetchBillsWithAIChat();
  }, []);

  // Fetch problems, solutions, and media
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch problems
        const { data: problemsData } = await supabase
          .from("problem_chats")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch solutions (legislative drafts)
        const { data: solutionsData } = await supabase
          .from("legislative_drafts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch media
        const { data: mediaData } = await supabase
          .from("media_outputs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        // Set sample data if no real data exists
        setProblems(problemsData && problemsData.length > 0 ? problemsData : [
          {
            id: "sample-1",
            problem_number: "P00001",
            title: "Healthcare Access",
            problem_statement: "Limited access to affordable healthcare in rural areas of New York State",
            current_state: "Problem Identified",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "sample-2", 
            problem_number: "P00002",
            title: "Education Funding",
            problem_statement: "Inadequate funding for public schools leading to resource shortages",
            current_state: "In Progress",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "sample-3",
            problem_number: "P00003", 
            title: "Transportation Infrastructure",
            problem_statement: "Aging public transportation systems requiring modernization",
            current_state: "Resolved",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString(),
          }
        ]);

        setSolutions(solutionsData && solutionsData.length > 0 ? solutionsData : [
          {
            id: "solution-1",
            title: "Rural Healthcare Access Act",
            draft_content: "AN ACT to establish telemedicine centers in underserved rural communities across New York State, providing expanded access to specialized medical care through technology partnerships with major medical centers.",
            status: "draft",
            type: "Legislative Draft",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "solution-2",
            title: "Education Funding Reform Bill", 
            draft_content: "AN ACT to amend the education law, in relation to establishing a more equitable funding formula for public schools that accounts for regional cost differences and student population demographics.",
            status: "in_review",
            type: "Legislative Draft",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "solution-3",
            title: "Green Transportation Initiative",
            draft_content: "AN ACT to authorize bonds for the modernization of public transportation infrastructure with a focus on electric buses and renewable energy-powered rail systems.",
            status: "published",
            type: "Policy Brief",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString(),
          }
        ]);

        setMedia(mediaData && mediaData.length > 0 ? mediaData : [
          {
            id: "media-1",
            title: "Healthcare Access Press Release",
            content: "FOR IMMEDIATE RELEASE: New legislation introduced to address rural healthcare access challenges through innovative telemedicine programs and community health partnerships.",
            content_type: "press_release",
            status: "draft",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "media-2",
            title: "Education Funding Social Media Campaign",
            content: "🏫 Every child deserves quality education! Our new funding reform ensures equitable resources for all NY public schools. #EducationForAll #NYEducation #PublicSchools",
            content_type: "social_media", 
            status: "in_review",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "media-3",
            title: "Transportation Newsletter",
            content: "This month's focus: Modernizing New York's transportation infrastructure for a greener, more efficient future. Learn about our latest initiatives to bring electric buses and renewable energy to public transit.",
            content_type: "newsletter",
            status: "published",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString(),
          }
        ]);

      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAIAnalysis = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat(bill);
    setChatOpen(true);
    
    // Add this bill to the set of bills with AI chat
    setBillsWithAIChat(prev => new Set([...prev, bill.bill_id]));
  };

  const handleFavorite = async (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    // Automatic saving - no need for user confirmation
    await toggleFavorite(bill.bill_id);
  };

  const handleBillSelect = (bill: Bill) => {
    // Navigate to bill detail page
    window.location.href = `/bills?selected=${bill.bill_id}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-full"></div>
            <div className="h-40 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bill">Bill</TabsTrigger>
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <AllItemsTable 
                bills={bills}
                problems={problems}
                solutions={solutions}
                media={media}
                onBillSelect={handleBillSelect}
                onAIAnalysis={handleAIAnalysis}
                onFavorite={handleFavorite}
                favoriteBillIds={favoriteBillIds}
                billsWithAIChat={billsWithAIChat}
              />
            </TabsContent>

            <TabsContent value="bill" className="mt-6">
              <div className="w-full">
                <BillsTableMobile
                  bills={bills}
                  onBillSelect={handleBillSelect}
                  onAIAnalysis={handleAIAnalysis}
                  onFavorite={handleFavorite}
                  favoriteBillIds={favoriteBillIds}
                  billsWithAIChat={billsWithAIChat}
                />

                <BillsTableDesktop
                  bills={bills}
                  onBillSelect={handleBillSelect}
                  onAIAnalysis={handleAIAnalysis}
                  onFavorite={handleFavorite}
                  favoriteBillIds={favoriteBillIds}
                  billsWithAIChat={billsWithAIChat}
                />
              </div>
            </TabsContent>

            <TabsContent value="problem" className="mt-6">
              <ProblemsTable problems={problems} />
            </TabsContent>

            <TabsContent value="solution" className="mt-6">
              <SolutionsTable solutions={solutions} />
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              <MediaTable media={media} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </>
  );
};

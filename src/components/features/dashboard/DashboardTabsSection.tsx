
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { DashboardBillsTable } from "./DashboardBillsTable";
import { MembersTable } from "./MembersTable";
import { CommitteesTable } from "./CommitteesTable";
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


  return (
    <>
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Table</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="bill" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="bill">Bills</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="committees">Committees</TabsTrigger>
            </TabsList>

            <TabsContent value="bill" className="mt-6">
              <DashboardBillsTable />
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <MembersTable limit={10} />
            </TabsContent>

            <TabsContent value="committees" className="mt-6">
              <CommitteesTable limit={10} />
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

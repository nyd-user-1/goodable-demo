
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AIChatSheet } from "@/components/AIChatSheet";
import { useFavorites } from "@/hooks/useFavorites";
import { BillsTableMobile } from "./BillsTableMobile";
import { BillsTableDesktop } from "./BillsTableDesktop";
import { Bill, BillsTableProps } from "./types";

export const BillsTable = ({ bills, onBillSelect }: BillsTableProps) => {
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

  return (
    <div className="w-full">
      <BillsTableMobile
        bills={bills}
        onBillSelect={onBillSelect}
        onAIAnalysis={handleAIAnalysis}
        onFavorite={handleFavorite}
        favoriteBillIds={favoriteBillIds}
        billsWithAIChat={billsWithAIChat}
      />

      <BillsTableDesktop
        bills={bills}
        onBillSelect={onBillSelect}
        onAIAnalysis={handleAIAnalysis}
        onFavorite={handleFavorite}
        favoriteBillIds={favoriteBillIds}
        billsWithAIChat={billsWithAIChat}
      />

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </div>
  );
};

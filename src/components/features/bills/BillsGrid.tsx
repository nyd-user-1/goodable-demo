
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BillCard } from "./BillCard";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { BillPDFSheet } from "./BillPDFSheet";

type Bill = Tables<"Bills">;

interface BillsGridProps {
  bills: Bill[];
  onBillSelect: (bill: Bill) => void;
}

export const BillsGrid = ({ bills, onBillSelect }: BillsGridProps) => {
  const navigate = useNavigate();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedBillForPDF, setSelectedBillForPDF] = useState<Bill | null>(null);
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

  const handleAIAnalysis = async (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Create a new chat session for this bill
      const sessionData = {
        user_id: user.id,
        bill_id: bill.bill_id,
        title: `Chat about ${bill.bill_number || 'Bill'}`,
        messages: JSON.stringify([])
      };

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Navigate to the new chat with the initial prompt
      const initialPrompt = `Tell me about bill ${bill.bill_number}`;
      navigate(`/c/${data.id}?prompt=${encodeURIComponent(initialPrompt)}`);

      // Add this bill to the set of bills with AI chat
      setBillsWithAIChat(prev => new Set([...prev, bill.bill_id]));
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  const handleFavorite = async (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    // Automatic saving - no need for user confirmation
    await toggleFavorite(bill.bill_id);
  };

  const handlePDFView = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForPDF(bill);
    setPdfOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map((bill) => (
          <BillCard
            key={bill.bill_id}
            bill={bill}
            onBillSelect={onBillSelect}
            onAIAnalysis={handleAIAnalysis}
            onFavorite={handleFavorite}
            onPDFView={handlePDFView}
            isFavorited={favoriteBillIds.has(bill.bill_id)}
            hasAIChat={billsWithAIChat.has(bill.bill_id)}
          />
        ))}
      </div>

      <BillPDFSheet
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        billNumber={selectedBillForPDF?.bill_number || ""}
        billTitle={selectedBillForPDF?.title || ""}
        bill={selectedBillForPDF}
      />
    </>
  );
};

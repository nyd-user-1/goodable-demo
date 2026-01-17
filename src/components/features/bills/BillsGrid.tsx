
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

  const handleAIAnalysis = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to chat with prompt - the chat page will create the session
    const initialPrompt = `Tell me about bill ${bill.bill_number}`;
    navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
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

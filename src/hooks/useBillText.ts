import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBillText(billNumber: string | null, sessionId: number | null, enabled: boolean) {
  return useQuery<string | null>({
    queryKey: ["bill-text", billNumber, sessionId],
    queryFn: async () => {
      if (!billNumber || !sessionId) return null;

      const { data, error } = await supabase.functions.invoke(
        "nys-legislation-search",
        {
          body: {
            action: "get-bill-detail",
            billNumber,
            sessionYear: sessionId,
            view: "default",
            fullTextFormat: "html",
          },
        }
      );

      if (error) {
        console.error("Error fetching bill text:", error);
        return null;
      }

      const result = data?.result;
      if (!result) return null;

      // Try active amendment version first
      const activeVersion = result.activeVersion ?? "";
      const items = result.amendments?.items;
      if (items) {
        const amendment = items[activeVersion];
        if (amendment?.fullText) return amendment.fullText;

        // Fallback: try any amendment that has fullText
        for (const key of Object.keys(items)) {
          if (items[key]?.fullText) return items[key].fullText;
        }
      }

      // Last fallback: direct fullText on result
      return result.fullText || null;
    },
    enabled: enabled && !!billNumber && !!sessionId,
    staleTime: 30 * 60 * 1000,
  });
}

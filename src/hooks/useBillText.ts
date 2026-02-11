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
            view: "only_fulltext",
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

      // Extract full text from the active amendment version
      const activeVersion = result.activeVersion || "";
      const amendment = result.amendments?.items?.[activeVersion];
      return amendment?.fullText || null;
    },
    enabled: enabled && !!billNumber && !!sessionId,
    staleTime: 30 * 60 * 1000, // 30 min cache - text rarely changes
  });
}

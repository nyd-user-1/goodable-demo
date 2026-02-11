import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function extractFullText(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;

  // Direct fullText field
  if (typeof obj.fullText === "string" && obj.fullText.length > 0) {
    return obj.fullText;
  }

  // Check amendments.items (NYS API nests versions here)
  const items = obj.amendments?.items;
  if (items && typeof items === "object") {
    // Try activeVersion key first
    const ver = obj.activeVersion ?? "";
    if (items[ver]?.fullText) return items[ver].fullText;

    // Try every key
    for (const key of Object.keys(items)) {
      if (items[key]?.fullText) return items[key].fullText;
    }
  }

  return null;
}

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
        console.error("[BillText] Edge function error:", error);
        return null;
      }

      // Log the response shape for debugging
      console.log("[BillText] Response keys:", data ? Object.keys(data) : "null");

      // The edge function proxies the raw NYS API response: { success, result, ... }
      const result = data?.result;
      if (!result) {
        console.warn("[BillText] No result in response. Full data:", JSON.stringify(data)?.substring(0, 500));
        return null;
      }

      console.log("[BillText] activeVersion:", result.activeVersion, "amendment keys:", result.amendments?.items ? Object.keys(result.amendments.items) : "none");

      const text = extractFullText(result);
      if (!text) {
        console.warn("[BillText] No fullText found in amendments");
      }
      return text;
    },
    enabled: enabled && !!billNumber && !!sessionId,
    staleTime: 30 * 60 * 1000,
  });
}

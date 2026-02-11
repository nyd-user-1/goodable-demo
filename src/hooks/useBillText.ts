import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function extractFullText(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;

  const items = obj.amendments?.items;
  if (items && typeof items === "object") {
    const ver = obj.activeVersion ?? "";
    // Try activeVersion key first, then all keys
    const keysToTry = [ver, ...Object.keys(items).filter((k) => k !== ver)];
    for (const key of keysToTry) {
      const amendment = items[key];
      if (!amendment) continue;
      // fullTextHtml is populated when fullTextFormat=html is requested
      if (amendment.fullTextHtml) return amendment.fullTextHtml;
      if (amendment.fullText) return amendment.fullText;
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

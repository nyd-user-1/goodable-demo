import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BillVersion {
  basePrintNo: string;
  session: number;
  printNo: string;
  version: string;
}

export interface BillMilestone {
  statusType: string;
  statusDesc: string;
  actionDate: string | null;
  committeeName: string | null;
  billCalNo: number | null;
}

export interface BillAction {
  date: string;
  chamber: string;
  text: string;
  sequenceNo: number;
}

export interface BillExtendedData {
  previousVersions: BillVersion[];
  sameAs: BillVersion[];
  substitutedBy: BillVersion | null;
  milestones: BillMilestone[];
  actions: BillAction[];
  activeVersion: string;
  lawSection: string | null;
  lawCode: string | null;
  memo: string | null;
  actClause: string | null;
  session: number;
  basePrintNo: string;
}

export function useBillExtendedData(billNumber: string | null, sessionId: number | null) {
  return useQuery<BillExtendedData | null>({
    queryKey: ["bill-extended", billNumber, sessionId],
    queryFn: async () => {
      if (!billNumber || !sessionId) return null;

      const { data, error } = await supabase.functions.invoke(
        "nys-legislation-search",
        {
          body: {
            action: "get-bill-detail",
            billNumber,
            sessionYear: sessionId,
            view: "no_fulltext",
          },
        }
      );

      if (error) {
        console.error("Error fetching extended bill data:", error);
        return null;
      }

      const result = data?.result;
      if (!result) return null;

      // Extract active amendment version data
      const activeVersion = result.activeVersion || "";
      const amendment = result.amendments?.items?.[activeVersion];

      // Extract sameAs from the active amendment
      const sameAs: BillVersion[] =
        amendment?.sameAs?.items?.map((s: any) => ({
          basePrintNo: s.basePrintNo,
          session: s.session,
          printNo: s.printNo,
          version: s.version || "",
        })) || [];

      // Extract previous versions
      const previousVersions: BillVersion[] =
        result.previousVersions?.items?.map((v: any) => ({
          basePrintNo: v.basePrintNo,
          session: v.session,
          printNo: v.printNo,
          version: v.version || "",
        })) || [];

      // Extract substitutedBy
      const sub = result.substitutedBy;
      const substitutedBy: BillVersion | null = sub?.basePrintNo
        ? {
            basePrintNo: sub.basePrintNo,
            session: sub.session,
            printNo: sub.printNo || sub.basePrintNo,
            version: sub.version || "",
          }
        : null;

      // Extract milestones
      const milestones: BillMilestone[] =
        result.milestones?.items?.map((m: any) => ({
          statusType: m.statusType,
          statusDesc: m.statusDesc,
          actionDate: m.actionDate,
          committeeName: m.committeeName,
          billCalNo: m.billCalNo,
        })) || [];

      // Extract actions
      const actions: BillAction[] =
        result.actions?.items?.map((a: any) => ({
          date: a.date,
          chamber: a.chamber,
          text: a.text,
          sequenceNo: a.sequenceNo,
        })) || [];

      return {
        previousVersions,
        sameAs,
        substitutedBy,
        milestones,
        actions,
        activeVersion,
        lawSection: amendment?.lawSection || null,
        lawCode: amendment?.lawCode || null,
        memo: amendment?.memo || null,
        actClause: amendment?.actClause || null,
        session: result.session,
        basePrintNo: result.basePrintNo,
      };
    },
    enabled: !!billNumber && !!sessionId,
    staleTime: 10 * 60 * 1000,
  });
}

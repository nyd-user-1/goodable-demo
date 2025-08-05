import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface DashboardStats {
  totalBills: number;
  activeChats: number;
  totalCommittees: number;
  totalMembers: number;
}

interface ChartDataPoint {
  period: string;
  assembly: number;
  senate: number;
}

export const useDashboardData = (selectedMonth: string = "01", selectedYear: string = "2024") => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBills: 0,
    activeChats: 0,
    totalCommittees: 0,
    totalMembers: 0,
  });
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const [billsResponse, committeesResponse, membersResponse] = await Promise.all([
        supabase.from("Bills").select("*", { count: "exact", head: true }),
        supabase.from("Committees").select("*", { count: "exact", head: true }),
        supabase.from("People").select("*", { count: "exact", head: true }),
      ]);

      // Fetch active chats count (user-specific)
      const { count: activeChatsCount } = await supabase
        .from("chat_sessions")
        .select("*", { count: "exact", head: true });

      setStats({
        totalBills: billsResponse.count || 0,
        activeChats: activeChatsCount || 0,
        totalCommittees: committeesResponse.count || 0,
        totalMembers: membersResponse.count || 0,
      });

      // Fetch recent bills with sponsors
      const { data: billsData } = await supabase
        .from("Bills")
        .select("*")
        .not("last_action_date", "is", null)
        .order("last_action_date", { ascending: false })
        .limit(10);

      if (billsData) {
        const billsWithSponsors = await Promise.all(
          billsData.map(async (bill) => {
            const { data: sponsorsData } = await supabase
              .from("Sponsors")
              .select("people_id, position")
              .eq("bill_id", bill.bill_id)
              .order("position", { ascending: true })
              .limit(3);

            let sponsors: Array<{ name: string | null; party: string | null; chamber: string | null; }> = [];
            
            if (sponsorsData && sponsorsData.length > 0) {
              const peopleIds = sponsorsData.map(s => s.people_id).filter(Boolean);
              if (peopleIds.length > 0) {
                const { data: peopleData } = await supabase
                  .from("People")
                  .select("people_id, name, party, chamber")
                  .in("people_id", peopleIds);
                
                sponsors = sponsorsData.map(sponsor => {
                  const person = peopleData?.find(p => p.people_id === sponsor.people_id);
                  return {
                    name: person?.name || null,
                    party: person?.party || null,
                    chamber: person?.chamber || null
                  };
                }).filter(s => s.name);
              }
            }

            return { ...bill, sponsors };
          })
        );

        setRecentBills(billsWithSponsors);
      }

      // Generate chart data based on selected month and year
      const generateChartData = async () => {
        const periods = [];
        const year = parseInt(selectedYear);
        const month = parseInt(selectedMonth);
        
        // Get days in the selected month
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Create date ranges for each week of the month
        const weeks = [];
        const currentDate = new Date(year, month - 1, 1);
        
        while (currentDate.getMonth() === month - 1) {
          const weekStart = new Date(currentDate);
          const weekEnd = new Date(currentDate);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          // Ensure we don't go past the end of the month
          if (weekEnd.getMonth() !== month - 1) {
            weekEnd.setMonth(month - 1);
            weekEnd.setDate(daysInMonth);
          }
          
          weeks.push({
            start: new Date(weekStart),
            end: new Date(weekEnd),
            label: `Week ${weeks.length + 1}`
          });
          
          currentDate.setDate(currentDate.getDate() + 7);
        }

        // Query bills for each week
        for (const week of weeks) {
          const { data: billsInWeek } = await supabase
            .from("Bills")
            .select("bill_number")
            .gte("last_action_date", week.start.toISOString().split('T')[0])
            .lte("last_action_date", week.end.toISOString().split('T')[0]);

          const totalBills = billsInWeek?.length || 0;
          
          // Split between Assembly and Senate bills
          const assemblyBills = billsInWeek?.filter(bill => 
            bill.bill_number?.toUpperCase().startsWith('A')
          ).length || 0;
          const senateBills = totalBills - assemblyBills;

          periods.push({
            period: week.label,
            assembly: assemblyBills,
            senate: senateBills,
          });
        }
        
        return periods;
      };

      const chartData = await generateChartData();
      setChartData(chartData);

    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  return {
    stats,
    recentBills,
    chartData,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
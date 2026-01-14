import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, FileText, Users, Building2, TrendingUp, Calendar, Eye, MessageSquare } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardTabsSection } from "@/components/features/dashboard/DashboardTabsSection";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BetaAccessModal } from "@/components/BetaAccessModal";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

export const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("05");
  const [selectedYear, setSelectedYear] = useState("2025");
  const { stats, recentBills, chartData, loading, error, refetch } = useDashboardData(selectedMonth, selectedYear);
  const navigate = useNavigate();

  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  const years = [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ];

  const handleViewAllMembers = () => {
    navigate('/members');
  };

  const handleViewAllCommittees = () => {
    navigate('/committees');
  };

  const handleViewAllChats = () => {
    navigate('/chats');
  };

  const handleViewAllBills = () => {
    navigate('/bills');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background overflow-x-hidden">
        <div className="container mx-auto px-[27px] py-4 sm:py-6 max-w-7xl">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Overview</h1>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-background overflow-x-hidden">
        <div className="container mx-auto px-[27px] py-4 sm:py-6 max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container w-full min-h-screen bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-[27px] py-4 sm:py-6 max-w-7xl">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Intelligence</h1>
            </div>
          </div>

          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewAllMembers}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Members</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="text-2xl sm:text-3xl xl:text-4xl font-bold">{stats.totalMembers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-primary text-primary-foreground" onClick={handleViewAllChats}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate text-primary-foreground">Active Chats</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-primary-foreground">{stats.activeChats.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewAllCommittees}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Committees</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="text-2xl sm:text-3xl xl:text-4xl font-bold">{stats.totalCommittees.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewAllBills}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Bills</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="text-2xl sm:text-3xl xl:text-4xl font-bold">{stats.totalBills.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base sm:text-lg">Activity</CardTitle>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[80px] sm:w-[100px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[80px] sm:w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription className="text-sm">
                Number of bills introduced over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-[200px] sm:h-[300px] lg:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      className="text-muted-foreground"
                      tick={{ fontSize: 11 }}
                      tickMargin={8}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      tick={{ fontSize: 10 }}
                      tickMargin={4}
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="assembly" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="hsl(var(--muted))"
                      fillOpacity={0.45}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="senate" 
                      stackId="1"
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      fill="hsl(var(--muted-foreground))"
                      fillOpacity={0.3}
                      dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Tabs Section */}
          <DashboardTabsSection bills={recentBills} />
        </div>
      </div>

      {/* Beta Access Modal - triggers after 2 chat inputs */}
      <BetaAccessModal />
    </div>
  );
};

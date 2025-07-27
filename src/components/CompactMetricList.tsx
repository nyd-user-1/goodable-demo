import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, ChevronUp, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  CreditCard,
  Globe,
  HardDrive,
  Info,
  LineChart,
  RefreshCw,
  Server,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompactMetric {
  id: string;
  icon: React.ReactNode;
  name: string;
  value: string;
  previousValue?: string;
  changePercentage?: number;
  status?: "positive" | "negative" | "neutral" | "warning";
  category: string;
  info?: string;
}

export default function CompactMetricList() {
  const [activeTab, setActiveTab] = useState("all");

  const metrics: CompactMetric[] = [
    // Performance Metrics - Reduced to 3
    {
      id: "response-time",
      icon: <Zap className="h-4 w-4" />,
      name: "Response Time",
      value: "32ms",
      previousValue: "39ms",
      changePercentage: -18,
      status: "positive",
      category: "performance",
      info: "Average API response time across all endpoints",
    },
    {
      id: "uptime",
      icon: <Server className="h-4 w-4" />,
      name: "System Uptime",
      value: "99.99%",
      previousValue: "99.97%",
      changePercentage: 0.02,
      status: "positive",
      category: "performance",
      info: "Service availability over the past 30 days",
    },
    {
      id: "requests",
      icon: <RefreshCw className="h-4 w-4" />,
      name: "Requests/Sec",
      value: "45K",
      previousValue: "34K",
      changePercentage: 32,
      status: "neutral",
      category: "performance",
      info: "Peak request rate during high traffic periods",
    },

    // Security Metrics - Reduced to 2
    {
      id: "blocked-threats",
      icon: <Shield className="h-4 w-4" />,
      name: "Threats Blocked",
      value: "1.2M+",
      previousValue: "970K",
      changePercentage: 24,
      status: "positive",
      category: "security",
      info: "Malicious requests blocked monthly",
    },
    {
      id: "2fa-adoption",
      icon: <AlertCircle className="h-4 w-4" />,
      name: "2FA Adoption",
      value: "78%",
      previousValue: "65%",
      changePercentage: 20,
      status: "positive",
      category: "security",
      info: "Percentage of users with 2FA enabled",
    },

    // User Metrics - Reduced to 2
    {
      id: "active-users",
      icon: <Users className="h-4 w-4" />,
      name: "Active Users",
      value: "2.4M",
      previousValue: "2.05M",
      changePercentage: 17,
      status: "positive",
      category: "users",
      info: "Monthly active users",
    },
    {
      id: "retention",
      icon: <BarChart3 className="h-4 w-4" />,
      name: "30d Retention",
      value: "84%",
      previousValue: "79%",
      changePercentage: 6.3,
      status: "positive",
      category: "users",
      info: "User retention rate after 30 days",
    },

    // Infrastructure Metrics - Reduced to 2
    {
      id: "data-processed",
      icon: <HardDrive className="h-4 w-4" />,
      name: "Data Processed",
      value: "8.7 PB",
      previousValue: "6.1 PB",
      changePercentage: 42,
      status: "neutral",
      category: "infrastructure",
      info: "Total data processed monthly",
    },
    {
      id: "bandwidth",
      icon: <Globe className="h-4 w-4" />,
      name: "Bandwidth Usage",
      value: "240 TB",
      previousValue: "190 TB",
      changePercentage: 26,
      status: "warning",
      category: "infrastructure",
      info: "Total bandwidth consumption this month",
    },

    // Business Metrics - Reduced to 2
    {
      id: "transactions",
      icon: <CreditCard className="h-4 w-4" />,
      name: "Transactions",
      value: "$740M",
      previousValue: "$578M",
      changePercentage: 28,
      status: "positive",
      category: "business",
      info: "Total transaction volume processed",
    },
    {
      id: "mrr",
      icon: <LineChart className="h-4 w-4" />,
      name: "MRR",
      value: "$4.2M",
      previousValue: "$3.6M",
      changePercentage: 16.7,
      status: "positive",
      category: "business",
      info: "Monthly recurring revenue",
    },
  ];

  // Filter metrics based on active tab
  const filteredMetrics =
    activeTab === "all"
      ? metrics
      : metrics.filter((metric) => metric.category === activeTab);

  // Function to handle tab change via dropdown
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <section className="bg-background w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
        <div className="mb-8 flex flex-col items-center justify-center space-y-4 text-center">
          <Badge className="px-3.5 py-1.5">System Metrics</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Platform Health & Performance
          </h2>
          <p className="text-muted-foreground max-w-[700px] md:text-lg">
            Key metrics across our infrastructure, security, and business
            operations.
          </p>
        </div>

        <Card className="border p-0 shadow-sm">
          <CardContent className="p-0">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full gap-0"
            >
              {/* Mobile view: Dropdown for categories */}
              <div className="border-b p-3 md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>
                        {activeTab === "all"
                          ? "All Metrics"
                          : activeTab.charAt(0).toUpperCase() +
                            activeTab.slice(1)}
                      </span>
                      <Menu className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem onClick={() => handleTabChange("all")}>
                      All Metrics
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTabChange("performance")}
                    >
                      Performance
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTabChange("security")}
                    >
                      Security
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTabChange("users")}>
                      Users
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTabChange("infrastructure")}
                    >
                      Infrastructure
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTabChange("business")}
                    >
                      Business
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop view: Horizontal tabs */}
              <div className="hidden border-b px-4 md:block">
                <TabsList className="h-12 bg-transparent">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-muted rounded-none data-[state=active]:shadow-none"
                  >
                    All Metrics
                  </TabsTrigger>
                  <TabsTrigger
                    value="performance"
                    className="data-[state=active]:bg-muted rounded-none data-[state=active]:shadow-none"
                  >
                    Performance
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-muted rounded-none data-[state=active]:shadow-none"
                  >
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="data-[state=active]:bg-muted rounded-none data-[state=active]:shadow-none"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger
                    value="infrastructure"
                    className="data-[state=active]:bg-muted rounded-none data-[state=active]:shadow-none"
                  >
                    Infrastructure
                  </TabsTrigger>
                  <TabsTrigger
                    value="business"
                    className="data-[state=active]:bg-muted rounded-none data-[state=active]:shadow-none"
                  >
                    Business
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-0 p-0">
                <div className="grid grid-cols-1 divide-y">
                  {filteredMetrics.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">
                      No metrics available for this category.
                    </div>
                  ) : (
                    filteredMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="hover:bg-muted/50 flex items-center justify-between px-4 py-4 transition-colors md:px-6"
                      >
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full",
                              metric.status === "positive" &&
                                "bg-green-100 text-green-600",
                              metric.status === "negative" &&
                                "bg-red-100 text-red-600",
                              metric.status === "warning" &&
                                "bg-amber-100 text-amber-600",
                              metric.status === "neutral" &&
                                "bg-blue-100 text-blue-600",
                            )}
                          >
                            {metric.icon}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="text-sm font-medium">
                                {metric.name}
                              </span>
                              {metric.info && (
                                <div className="group relative ml-1.5">
                                  <Info className="text-muted-foreground h-3.5 w-3.5 cursor-help" />
                                  <div className="bg-background invisible absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 transform rounded border p-2 text-xs opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
                                    {metric.info}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="text-muted-foreground text-xs capitalize">
                              {metric.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 md:space-x-4">
                          {metric.previousValue && (
                            <span className="text-muted-foreground hidden text-sm md:inline-block">
                              {metric.previousValue}
                            </span>
                          )}

                          <div className="flex flex-col items-end">
                            <span className="font-bold">{metric.value}</span>

                            {metric.changePercentage !== undefined && (
                              <div
                                className={cn(
                                  "flex items-center text-xs",
                                  metric.status === "positive" &&
                                    "text-green-600",
                                  metric.status === "negative" &&
                                    "text-red-600",
                                  metric.status === "warning" &&
                                    "text-amber-600",
                                  metric.status === "neutral" &&
                                    "text-blue-600",
                                )}
                              >
                                {metric.changePercentage > 0 ? (
                                  <ChevronUp className="mr-0.5 h-3 w-3" />
                                ) : metric.changePercentage < 0 ? (
                                  <ChevronDown className="mr-0.5 h-3 w-3" />
                                ) : null}
                                {Math.abs(metric.changePercentage)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-muted-foreground order-2 text-sm sm:order-1">
            <span className="font-medium">Last updated:</span> Today at 15:42
            UTC
          </div>

          <Button
            variant="outline"
            size="sm"
            className="group order-1 sm:order-2"
            asChild
          >
            <Link to="#">
              View complete dashboard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
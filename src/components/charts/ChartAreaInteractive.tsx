"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"

// Generate data based on published policy posts
const generateLegislativeData = () => {
  // Get published policies from localStorage
  const publishedPosts = JSON.parse(localStorage.getItem('publishedPolicies') || '[]');
  
  // If no published posts, return sample data
  if (publishedPosts.length === 0) {
    const data = [];
    const startDate = new Date('2024-01-01');
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Legislative activity typically higher mid-week and during session
      const dayOfWeek = date.getDay();
      const weekMultiplier = dayOfWeek >= 1 && dayOfWeek <= 4 ? 1.2 : 0.8;
      
      // Add some seasonality - higher activity in spring legislative session
      const monthMultiplier = date.getMonth() >= 2 && date.getMonth() <= 5 ? 1.3 : 0.9;
      
      const baseBills = Math.floor(Math.random() * 50 + 20) * weekMultiplier * monthMultiplier;
      const baseProposals = Math.floor(Math.random() * 80 + 30) * weekMultiplier * monthMultiplier;
      
      data.push({
        date: date.toISOString().split('T')[0],
        bills: Math.floor(baseBills),
        proposals: Math.floor(baseProposals)
      });
    }
    
    return data;
  }
  
  // Group published posts by date
  const postsByDate = {};
  publishedPosts.forEach(post => {
    const date = new Date(post.publishedAt).toISOString().split('T')[0];
    if (!postsByDate[date]) {
      postsByDate[date] = { proposals: 0, bills: 0 };
    }
    postsByDate[date].proposals += 1;
    // Add some bills data based on proposals (simulated correlation)
    postsByDate[date].bills += Math.floor(Math.random() * 3 + 1);
  });
  
  // Create chart data for the last 90 days
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Use real data if available, otherwise baseline values
    const realData = postsByDate[dateStr];
    const baselineProposals = Math.floor(Math.random() * 20 + 10);
    const baselineBills = Math.floor(Math.random() * 30 + 15);
    
    data.push({
      date: dateStr,
      bills: realData ? realData.bills + baselineBills : baselineBills,
      proposals: realData ? realData.proposals + baselineProposals : baselineProposals
    });
  }
  
  return data;
};

const getChartData = () => generateLegislativeData();

const chartConfig = {
  activity: {
    label: "Legislative Activity",
  },
  bills: {
    label: "Bills Introduced",
    color: "#3D63DD",
  },
  proposals: {
    label: "Proposals Submitted",
    color: "#5A7FDB",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState([])

  // Update chart data when component mounts or localStorage changes
  React.useEffect(() => {
    const updateData = () => {
      setChartData(getChartData())
    }
    
    updateData()
    
    // Listen for localStorage changes (when new policies are published)
    const handleStorageChange = (e) => {
      if (e.key === 'publishedPolicies') {
        updateData()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also update periodically for cross-tab updates
    const interval = setInterval(updateData, 5000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-03-31")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Legislative Activity</CardTitle>
          <CardDescription>
            Bills and proposals submitted over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillBills" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-bills)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-bills)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillProposals" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-proposals)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-proposals)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="proposals"
              type="natural"
              fill="url(#fillProposals)"
              stroke="var(--color-proposals)"
              stackId="a"
            />
            <Area
              dataKey="bills"
              type="natural"
              fill="url(#fillBills)"
              stroke="var(--color-bills)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
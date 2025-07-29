"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Jan", impact: 186, satisfaction: 80 },
  { month: "Feb", impact: 305, satisfaction: 75 },
  { month: "Mar", impact: 237, satisfaction: 82 },
  { month: "Apr", impact: 273, satisfaction: 85 },
  { month: "May", impact: 209, satisfaction: 78 },
  { month: "Jun", impact: 214, satisfaction: 83 },
  { month: "Jul", impact: 287, satisfaction: 88 },
  { month: "Aug", impact: 342, satisfaction: 91 },
  { month: "Sep", impact: 298, satisfaction: 86 },
  { month: "Oct", impact: 365, satisfaction: 94 },
  { month: "Nov", impact: 321, satisfaction: 89 },
  { month: "Dec", impact: 287, satisfaction: 92 },
]

const chartConfig = {
  impact: {
    label: "Policy Impact Score",
    color: "#3D63DD",
  },
  satisfaction: {
    label: "Satisfaction Rating",
    color: "#5A7FDB",
  },
} satisfies ChartConfig

export function ChartLinePolicyImpact() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy Impact</CardTitle>
        <CardDescription>
          Tracking effectiveness and satisfaction
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="impact"
              type="monotone"
              stroke="var(--color-impact)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="satisfaction"
              type="monotone"
              stroke="var(--color-satisfaction)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
  { category: "Healthcare", engagement: 2847, feedback: 1253 },
  { category: "Education", engagement: 2156, feedback: 987 },
  { category: "Environment", engagement: 1834, feedback: 742 },
  { category: "Housing", engagement: 3241, feedback: 1567 },
  { category: "Transportation", engagement: 1456, feedback: 623 },
  { category: "Budget", engagement: 2789, feedback: 1342 },
  { category: "Healthcare", engagement: 1923, feedback: 834 },
]

const chartConfig = {
  engagement: {
    label: "Citizen Engagement",
    color: "hsl(var(--chart-1))",
  },
  feedback: {
    label: "Expert Feedback", 
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartBarEngagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy Engagement by Category</CardTitle>
        <CardDescription>
          Citizen engagement and expert feedback across policy areas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 8)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="engagement" fill="var(--color-engagement)" radius={4} />
            <Bar dataKey="feedback" fill="var(--color-feedback)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
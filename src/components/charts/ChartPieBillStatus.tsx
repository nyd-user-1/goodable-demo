"use client"

import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"

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
  { status: "Passed", bills: 342, fill: "var(--color-passed)" },
  { status: "In Committee", bills: 186, fill: "var(--color-committee)" },
  { status: "Under Review", bills: 267, fill: "var(--color-review)" },
  { status: "Defeated", bills: 89, fill: "var(--color-defeated)" },
  { status: "Withdrawn", bills: 45, fill: "var(--color-withdrawn)" },
]

const chartConfig = {
  bills: {
    label: "Bills",
  },
  passed: {
    label: "Passed",
    color: "hsl(var(--chart-1))",
  },
  committee: {
    label: "In Committee",
    color: "hsl(var(--chart-2))",
  },
  review: {
    label: "Under Review",
    color: "hsl(var(--chart-3))",
  },
  defeated: {
    label: "Defeated",
    color: "hsl(var(--chart-4))",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ChartPieBillStatus() {
  const totalBills = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.bills, 0)
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Bill Status Distribution</CardTitle>
        <CardDescription>Current legislative session overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="bills"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              stroke="0"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-muted-foreground">
                {item.status}: {item.bills}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
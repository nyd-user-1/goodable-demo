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
  { status: "Passed", bills: 342, fill: "#3D63DD" },
  { status: "In Committee", bills: 186, fill: "#5A7FDB" },
  { status: "Under Review", bills: 267, fill: "#6B8CE8" },
  { status: "Defeated", bills: 89, fill: "#8B8D98" },
  { status: "Withdrawn", bills: 45, fill: "#A5A7B2" },
]

const chartConfig = {
  bills: {
    label: "Bills",
  },
  passed: {
    label: "Passed",
    color: "#3D63DD",
  },
  committee: {
    label: "In Committee",
    color: "#5A7FDB",
  },
  review: {
    label: "Under Review",
    color: "#6B8CE8",
  },
  defeated: {
    label: "Defeated",
    color: "#8B8D98",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "#A5A7B2",
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
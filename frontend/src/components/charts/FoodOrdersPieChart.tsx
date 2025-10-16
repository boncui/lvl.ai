"use client"

import React from "react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface FoodOrdersPieChartProps {
  data: Array<{
    name: string
    value: number
  }>
  height?: number
  colors?: string[]
  showTooltip?: boolean
  showLabels?: boolean
}

export function FoodOrdersPieChart({
  data,
  height = 250,
  colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"],
  showTooltip = true,
  showLabels = true,
}: FoodOrdersPieChartProps) {
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={showLabels ? (props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%` : false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

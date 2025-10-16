"use client"

import React from "react"
import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface RevenueBarChartProps {
  data: Array<{
    name: string
    value: number
  }>
  height?: number
  color?: string
  showTooltip?: boolean
  showGrid?: boolean
}

export function RevenueBarChart({
  data,
  height = 200,
  color = "#F59E0B",
  showTooltip = true,
  showGrid = true,
}: RevenueBarChartProps) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis hide={true} />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow-sm">
                      <p className="text-xs">{`${payload[0].value} K`}</p>
                    </div>
                  )
                }
                return null
              }}
            />
          )}
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

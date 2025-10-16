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

interface RoomsStackedBarChartProps {
  data: Array<{
    name: string
    occupied: number
    booked: number
    available: number
  }>
  height?: number
  colors?: {
    occupied: string
    booked: string
    available: string
  }
  showTooltip?: boolean
  showGrid?: boolean
}

export function RoomsStackedBarChart({
  data,
  height = 180,
  colors = {
    occupied: "#3B82F6",
    booked: "#10B981",
    available: "#F59E0B",
  },
  showTooltip = true,
  showGrid = true,
}: RoomsStackedBarChartProps) {
  return (
    <div className="h-[180px] w-full">
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
                      <p className="text-xs">{`Occupied: ${payload[0].value}`}</p>
                      <p className="text-xs">{`Booked: ${payload[1].value}`}</p>
                      <p className="text-xs">{`Available: ${payload[2].value}`}</p>
                    </div>
                  )
                }
                return null
              }}
            />
          )}
          <Bar dataKey="occupied" fill={colors.occupied} radius={[4, 4, 0, 0]} />
          <Bar dataKey="booked" fill={colors.booked} radius={[4, 4, 0, 0]} />
          <Bar dataKey="available" fill={colors.available} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

"use client"

import React from "react"
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts"

interface GuestsLineChartProps {
  data: Array<{
    name: string
    value: number
  }>
  height?: number
  color?: string
  showTooltip?: boolean
  showGrid?: boolean
}

export function GuestsLineChart({
  data,
  height = 200,
  color = "#3B82F6",
  showTooltip = true,
  showGrid = true,
}: GuestsLineChartProps) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis hide={true} />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow-sm">
                      <p className="text-xs">{`${payload[0].value}`}</p>
                    </div>
                  )
                }
                return null
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: "white", stroke: color, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            fill="url(#colorUv)"
          />
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke="none" fill="url(#colorUv)" />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import type { TimeSeriesData } from '@/lib/api/task';

interface XPProgressChartProps {
  data: TimeSeriesData[];
  period: 'week' | 'month' | 'year';
}

const XPProgressChart: React.FC<XPProgressChartProps> = ({ data, period }) => {
  const formatXAxis = (date: string) => {
    const d = new Date(date);
    switch (period) {
      case 'week':
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      case 'month':
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'year':
        return d.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date;
    }
  };

  // Calculate cumulative XP for the chart
  let cumulativeXP = 0;
  const chartData = data.map((item) => {
    cumulativeXP += item.xpEarned;
    return {
      ...item,
      formattedDate: formatXAxis(item.date),
      cumulativeXP,
    };
  });

  const totalXP = chartData.length > 0 ? chartData[chartData.length - 1].cumulativeXP : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-amber-500"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          XP Progression
        </CardTitle>
        <CardDescription>
          Track your experience points earned over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total XP Earned</p>
            <p className="text-3xl font-bold text-amber-600">{totalXP.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-amber-600"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="formattedDate"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'cumulativeXP') return [value.toLocaleString(), 'Total XP'];
                  if (name === 'xpEarned') return [value.toLocaleString(), 'XP Earned'];
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeXP"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#xpGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default XPProgressChart;


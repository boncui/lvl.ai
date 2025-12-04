'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import type { SkillScore } from '@/lib/api/task';

interface SkillRadarChartProps {
  data: SkillScore[];
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data }) => {
  // Prepare data for radar chart with minimum 3 points
  const chartData = data.map((item) => ({
    category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    score: item.score,
    tasksCompleted: item.tasksCompleted,
    fullMark: 100,
  }));

  // Add placeholder categories if less than 3
  while (chartData.length < 3) {
    chartData.push({
      category: `Category ${chartData.length + 1}`,
      score: 0,
      tasksCompleted: 0,
      fullMark: 100,
    });
  }

  const averageScore =
    data.length > 0
      ? Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length)
      : 0;

  const topCategory = data.length > 0 ? data.reduce((max, item) => (item.score > max.score ? item : max)) : null;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">
            Completion Rate: <span className="font-medium text-emerald-600">{data.score}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Tasks Completed: <span className="font-medium">{data.tasksCompleted}</span>
          </p>
        </div>
      );
    }
    return null;
  };

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
            className="h-5 w-5 text-emerald-500"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Skill Radar
        </CardTitle>
        <CardDescription>
          Your strengths across different task categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm text-emerald-600 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-emerald-900">{averageScore}%</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4">
            <p className="text-sm text-violet-600 font-medium">Top Category</p>
            <p className="text-lg font-bold text-violet-900 truncate">
              {topCategory?.category
                ? topCategory.category.charAt(0).toUpperCase() + topCategory.category.slice(1)
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="Skill Score"
                dataKey="score"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill breakdown list */}
        <div className="mt-6 space-y-3">
          {data.slice(0, 5).map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item.category}
                  </span>
                  <span className="text-sm text-gray-500">{item.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillRadarChart;


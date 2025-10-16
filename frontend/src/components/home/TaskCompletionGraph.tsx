'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
// import { TasksAPI, FoodTasksAPI, HealthTasksAPI, WorkTasksAPI } from '@/lib/api';
// import { BaseTask } from '@/lib/types';
// import { FoodTask } from '@/lib/api/foodTasks';
// import { HealthTask } from '@/lib/api/healthTasks';
// import { WorkTask } from '@/lib/api/workTasks';

interface TaskCompletionData {
  date: string;
  completed: number;
  total: number;
  completionRate: number;
}

type TimePeriod = 'week' | 'month' | 'year';

const TaskCompletionGraph: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [data, setData] = useState<TaskCompletionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { start, end: now };
  };

  const formatDate = (date: Date, period: TimePeriod) => {
    switch (period) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const generateDateLabels = (period: TimePeriod) => {
    const { start, end } = getDateRange(period);
    const labels: string[] = [];
    const current = new Date(start);

    switch (period) {
      case 'week':
        for (let i = 0; i < 7; i++) {
          labels.push(formatDate(new Date(current), period));
          current.setDate(current.getDate() + 1);
        }
        break;
      case 'month':
        for (let i = 0; i < 30; i++) {
          labels.push(formatDate(new Date(current), period));
          current.setDate(current.getDate() + 1);
        }
        break;
      case 'year':
        for (let i = 0; i < 12; i++) {
          labels.push(formatDate(new Date(current), period));
          current.setMonth(current.getMonth() + 1);
        }
        break;
    }

    return labels;
  };

  const fetchTaskCompletionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { start, end } = getDateRange(timePeriod);
      const dateLabels = generateDateLabels(timePeriod);

      // For now, use fallback data to avoid API issues
      // TODO: Implement proper API calls once backend is ready
      const fallbackData: TaskCompletionData[] = dateLabels.map((label, index) => {
        const completed = Math.floor(Math.random() * 8) + 2; // 2-10 tasks
        const total = completed + Math.floor(Math.random() * 3) + 1; // 1-3 pending
        const completionRate = Math.round((completed / total) * 100);
        
        return {
          date: label,
          completed,
          total,
          completionRate
        };
      });
      setData(fallbackData);
    } catch (err) {
      console.error('Error fetching task completion data:', err);
      setError('Failed to load task completion data');
      
      // Fallback data for demo purposes
      const dateLabels = generateDateLabels(timePeriod);
      const fallbackData: TaskCompletionData[] = dateLabels.map((label, index) => {
        const completed = Math.floor(Math.random() * 8) + 2; // 2-10 tasks
        const total = completed + Math.floor(Math.random() * 3) + 1; // 1-3 pending
        const completionRate = Math.round((completed / total) * 100);
        
        return {
          date: label,
          completed,
          total,
          completionRate
        };
      });
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskCompletionData();
  }, [timePeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
  };

  const getChartTitle = () => {
    switch (timePeriod) {
      case 'week':
        return 'Tasks Completed This Week';
      case 'month':
        return 'Tasks Completed This Month';
      case 'year':
        return 'Tasks Completed This Year';
    }
  };

  const getTotalCompleted = () => {
    return data.reduce((sum, item) => sum + item.completed, 0);
  };

  const getAverageCompletionRate = () => {
    if (data.length === 0) return 0;
    const totalRate = data.reduce((sum, item) => sum + item.completionRate, 0);
    return Math.round(totalRate / data.length);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getChartTitle()}</h2>
            <p className="text-gray-600 mt-1">
              Track your productivity and task completion over time
            </p>
          </div>
          
          {/* Time Period Selector */}
          <div className="flex space-x-2 mt-4 sm:mt-0">
            {(['week', 'month', 'year'] as TimePeriod[]).map((period) => (
              <Button
                key={period}
                variant={timePeriod === period ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTimePeriodChange(period)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Completed</div>
            <div className="text-2xl font-bold text-blue-900">{getTotalCompleted()}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Average Rate</div>
            <div className="text-2xl font-bold text-green-900">{getAverageCompletionRate()}%</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Best Day</div>
            <div className="text-2xl font-bold text-purple-900">
              {data.length > 0 ? Math.max(...data.map(d => d.completed)) : 0}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                label={{ value: 'Tasks', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'completed' ? 'Completed' : 
                  name === 'total' ? 'Total' : 
                  name === 'completionRate' ? 'Completion Rate (%)' : name
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Additional Bar Chart for Completion Rate */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar 
                  dataKey="completionRate" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 text-sm">
              {error}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskCompletionGraph;

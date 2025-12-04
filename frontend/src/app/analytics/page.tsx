'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ClientGuard from '@/components/ClientGuard';
import {
  XPProgressChart,
  CategoryBreakdown,
  SkillRadarChart,
  AIInsightsCard,
} from '@/components/analytics';
import { TaskAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { AnalyticsResponse } from '@/lib/api/task';
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

type TimePeriod = 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [analytics, setAnalytics] = useState<AnalyticsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (selectedPeriod: TimePeriod) => {
    setLoading(true);
    setError(null);
    try {
      const response = await TaskAPI.getAnalytics(selectedPeriod);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Using sample data.');
      // Set fallback data
      setAnalytics({
        summary: {
          totalTasks: 25,
          totalCompleted: 18,
          totalXPEarned: 450,
          completionRate: 72,
          averagePointsPerTask: 25,
          currentLevel: user?.level || 1,
          currentXP: user?.xp || 0,
          lifetimeTasksCompleted: user?.totalTasksCompleted || 0,
        },
        categoryBreakdown: [
          { category: 'work', total: 10, completed: 8, points: 200, completionRate: 80 },
          { category: 'personal', total: 8, completed: 5, points: 125, completionRate: 63 },
          { category: 'health', total: 5, completed: 4, points: 100, completionRate: 80 },
          { category: 'education', total: 2, completed: 1, points: 25, completionRate: 50 },
        ],
        timeSeriesData: generateSampleTimeSeriesData(selectedPeriod),
        skillScores: [
          { category: 'work', score: 80, tasksCompleted: 8 },
          { category: 'personal', score: 63, tasksCompleted: 5 },
          { category: 'health', score: 80, tasksCompleted: 4 },
          { category: 'education', score: 50, tasksCompleted: 1 },
          { category: 'social', score: 75, tasksCompleted: 3 },
        ],
        period: selectedPeriod,
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate sample time series data for fallback
  const generateSampleTimeSeriesData = (period: TimePeriod) => {
    const data = [];
    const now = new Date();
    const intervals = period === 'week' ? 7 : period === 'month' ? 30 : 12;

    for (let i = 0; i < intervals; i++) {
      const date = new Date(now);
      if (period === 'year') {
        date.setMonth(date.getMonth() - (intervals - 1 - i));
      } else {
        date.setDate(date.getDate() - (intervals - 1 - i));
      }

      data.push({
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 5) + 1,
        created: Math.floor(Math.random() * 6) + 2,
        xpEarned: Math.floor(Math.random() * 100) + 20,
      });
    }

    return data;
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
  };

  const getXPToNextLevel = () => {
    const currentXP = analytics?.summary.currentXP || user?.xp || 0;
    const currentLevel = analytics?.summary.currentLevel || user?.level || 1;
    const nextLevelXP = currentLevel * 100;
    return {
      current: currentXP,
      needed: nextLevelXP,
      progress: Math.min((currentXP / nextLevelXP) * 100, 100),
    };
  };

  const xpProgress = getXPToNextLevel();

  return (
    <ClientGuard>
      <Sidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground">
                Track your productivity and skill progression
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              {(['week', 'month', 'year'] as TimePeriod[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodChange(p)}
                  className="capitalize"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold">
                      {loading ? '...' : analytics?.summary.totalTasks || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-400/30 flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold">
                      {loading ? '...' : analytics?.summary.totalCompleted || 0}
                    </p>
                  </div>
                  <Badge variant="success" className="bg-green-400/30 text-white border-0">
                    {analytics?.summary.completionRate || 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">XP Earned</p>
                    <p className="text-3xl font-bold">
                      {loading ? '...' : (analytics?.summary.totalXPEarned || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-400/30 flex items-center justify-center">
                    <FireIcon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Current Level</p>
                    <p className="text-3xl font-bold">
                      {loading ? '...' : analytics?.summary.currentLevel || 1}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-400/30 flex items-center justify-center">
                    <TrophyIcon className="h-6 w-6" />
                  </div>
                </div>
                {/* Level progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-purple-200 mb-1">
                    <span>{xpProgress.current} XP</span>
                    <span>{xpProgress.needed} XP</span>
                  </div>
                  <div className="w-full bg-purple-400/30 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${xpProgress.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lifetime Stats Banner */}
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Lifetime Achievement</p>
                    <p className="text-2xl font-bold">
                      {analytics?.summary.lifetimeTasksCompleted || user?.totalTasksCompleted || 0} Tasks Completed
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-amber-400">
                      {analytics?.summary.averagePointsPerTask || 0}
                    </p>
                    <p className="text-gray-400 text-sm">Avg Points/Task</p>
                  </div>
                  <div className="w-px bg-gray-700" />
                  <div>
                    <p className="text-3xl font-bold text-green-400">
                      {analytics?.summary.completionRate || 0}%
                    </p>
                    <p className="text-gray-400 text-sm">Completion Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XP Progress Chart */}
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-pulse space-y-4 w-full">
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-64 bg-gray-200 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <XPProgressChart
                data={analytics?.timeSeriesData || []}
                period={period}
              />
            )}

            {/* Category Breakdown */}
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-pulse space-y-4 w-full">
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-64 bg-gray-200 rounded-full mx-auto w-48" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CategoryBreakdown data={analytics?.categoryBreakdown || []} />
            )}
          </div>

          {/* Second Row: Skill Radar and AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Radar Chart */}
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-pulse space-y-4 w-full">
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-64 bg-gray-200 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <SkillRadarChart data={analytics?.skillScores || []} />
            )}

            {/* AI Insights */}
            <AIInsightsCard onRefresh={() => fetchAnalytics(period)} />
          </div>

          {/* Quick Tips Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-blue-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                How to Improve Your Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Complete Daily Tasks</h4>
                  <p className="text-sm text-blue-700">Consistency is key to leveling up quickly</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">Diversify Categories</h4>
                  <p className="text-sm text-green-700">Balance tasks across all life areas</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-1">Tackle High Priority</h4>
                  <p className="text-sm text-amber-700">Urgent tasks earn more XP points</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-1">Maintain Streaks</h4>
                  <p className="text-sm text-purple-700">Daily activity builds momentum</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Sidebar>
    </ClientGuard>
  );
}


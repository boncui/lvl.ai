'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCurrentUserAPI } from '@/hooks/useUserAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, BaseTask, Metric, LevelProgress } from '@/lib/types';
import { 
  UserIcon, 
  TrophyIcon, 
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<BaseTask[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [levels, setLevels] = useState<Record<string, LevelProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userAPI = useCurrentUserAPI();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load user profile, tasks, metrics, and levels in parallel
        const [userData, tasksData, metricsData, levelsData] = await Promise.all([
          userAPI.getMyProfile(),
          userAPI.getMyTasks({ limit: 5 }),
          userAPI.getMyMetrics({ limit: 5 }),
          userAPI.getMyLevels(),
        ]);

        setUser(userData);
        setTasks(tasksData.data || []);
        setMetrics(metricsData.data || []);
        setLevels(levelsData);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userAPI]);

  const handleAddTask = async () => {
    try {
      const newTask = await userAPI.addTaskToMe({
        title: 'New Task',
        category: 'Productivity',
        xpValue: 10,
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  const handleAddMetric = async () => {
    try {
      const newMetric = await userAPI.addMetricToMe({
        metricType: 'workout',
        value: 30,
        unit: 'minutes',
        notes: 'Morning workout',
      });
      setMetrics(prev => [newMetric, ...prev]);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-error/10 border border-error/20">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
        <p className="text-warning">No user data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              {user.avatar ? (
                <Image 
                  src={user.avatar} 
                  alt={user.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="primary" size="sm">
                  Daily Goal: {user.preferences.dailyGoalXP} XP
                </Badge>
                <Badge variant="secondary" size="sm">
                  {user.preferences.timezone}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Levels Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5" />
            Level Progress
          </CardTitle>
          <CardDescription>Your progress across different life categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(levels).map(([category, progress]) => (
              <div key={category} className="p-4 rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">{category}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level {progress.level}</span>
                    <span>{progress.xp} XP</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.xp % 100) / 100 * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Streak: {progress.dailyStreak} days</span>
                    <span>Completed: {progress.totalCompleted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Recent Tasks
              </CardTitle>
              <CardDescription>Your latest task activity</CardDescription>
            </div>
            <Button onClick={handleAddTask} size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircleIcon className="h-5 w-5 text-success" />
                  ) : (
                    <ClockIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.taskType} • {task.xpValue} XP
                    </p>
                  </div>
                </div>
                <Badge variant={task.status === 'completed' ? 'success' : 'secondary'} size="sm">
                  {task.status}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No tasks yet. Add your first task!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Recent Metrics
              </CardTitle>
              <CardDescription>Your latest tracked metrics</CardDescription>
            </div>
            <Button onClick={handleAddMetric} size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.date.toString()} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-foreground capitalize">{metric.metricType}</p>
                  <p className="text-sm text-muted-foreground">
                    {metric.value} {metric.unit || ''} • {new Date(metric.date).toLocaleDateString()}
                  </p>
                  {metric.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{metric.notes}</p>
                  )}
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No metrics yet. Start tracking your progress!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

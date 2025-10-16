'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ClientGuard from '@/components/ClientGuard';
import { TaskCompletionGraph } from '@/components/home';
import { Calendar } from '@/components/charts/calender';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Mock data - in real app, this would come from API
  const stats = [
    { name: 'Total Tasks', value: '24', change: '+4', changeType: 'positive' },
    { name: 'Completed Today', value: '8', change: '+2', changeType: 'positive' },
    { name: 'Overdue Tasks', value: '3', change: '-1', changeType: 'negative' },
    { name: 'Current Streak', value: '12 days', change: '+1', changeType: 'positive' },
  ];

  const recentTasks = [
    { id: 1, title: 'Complete project proposal', priority: 'high', status: 'in_progress', dueDate: '2024-01-15' },
    { id: 2, title: 'Grocery shopping', priority: 'medium', status: 'pending', dueDate: '2024-01-14' },
    { id: 3, title: 'Morning workout', priority: 'high', status: 'completed', dueDate: '2024-01-13' },
    { id: 4, title: 'Team meeting prep', priority: 'urgent', status: 'pending', dueDate: '2024-01-14' },
  ];

  const achievements = [
    { name: 'Early Bird', description: 'Complete 5 tasks before 9 AM', progress: 3, target: 5 },
    { name: 'Consistency King', description: 'Maintain 7-day streak', progress: 7, target: 7 },
    { name: 'Task Master', description: 'Complete 50 tasks', progress: 42, target: 50 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-success" />;
      case 'in_progress': return <ClockIcon className="h-5 w-5 text-warning" />;
      case 'pending': return <ExclamationTriangleIcon className="h-5 w-5 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <ClientGuard>
      <Sidebar>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{user?.name ? `, ${user.name}` : ''}! Here&apos;s what&apos;s happening with your tasks.
            </p>
          </div>

          {/* Task Completion Graph */}
          <TaskCompletionGraph />
          
          {/* Calender */}
          <Calendar />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className="flex items-center">
                      <Badge 
                        variant={stat.changeType === 'positive' ? 'success' : 'error'}
                        size="sm"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Recent Tasks
                </CardTitle>
                <CardDescription>Your latest task activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <p className="font-medium text-foreground">{task.title}</p>
                          <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                        </div>
                      </div>
                          <Badge variant={getPriorityColor(task.priority) as 'default' | 'secondary' | 'warning' | 'error'} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrophyIcon className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Track your progress and unlock rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{achievement.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Achievements
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FireIcon className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button className="h-20 flex-col gap-2">
                  <ChartBarIcon className="h-6 w-6" />
                  <span>Add Task</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <ClockIcon className="h-6 w-6" />
                  <span>Start Timer</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrophyIcon className="h-6 w-6" />
                  <span>View Stats</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <CheckCircleIcon className="h-6 w-6" />
                  <span>Complete Task</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Sidebar>
    </ClientGuard>
  );
}
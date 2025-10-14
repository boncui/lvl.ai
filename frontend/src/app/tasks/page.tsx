'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function TasksPage() {
  // Mock data - in real app, this would come from API
  const tasks = [
    { 
      id: 1, 
      title: 'Complete project proposal', 
      description: 'Finish the Q1 project proposal for the new feature',
      priority: 'high', 
      status: 'in_progress', 
      dueDate: '2024-01-15',
      taskType: 'work',
      tags: ['work', 'urgent'],
      xpValue: 50
    },
    { 
      id: 2, 
      title: 'Grocery shopping', 
      description: 'Buy ingredients for the week',
      priority: 'medium', 
      status: 'pending', 
      dueDate: '2024-01-14',
      taskType: 'personal',
      tags: ['shopping', 'food'],
      xpValue: 20
    },
    { 
      id: 3, 
      title: 'Morning workout', 
      description: '30-minute cardio session',
      priority: 'high', 
      status: 'completed', 
      dueDate: '2024-01-13',
      taskType: 'health',
      tags: ['fitness', 'morning'],
      xpValue: 30
    },
    { 
      id: 4, 
      title: 'Team meeting prep', 
      description: 'Prepare slides for the weekly team meeting',
      priority: 'urgent', 
      status: 'pending', 
      dueDate: '2024-01-14',
      taskType: 'meeting',
      tags: ['work', 'presentation'],
      xpValue: 40
    },
    { 
      id: 5, 
      title: 'Read React documentation', 
      description: 'Study the new React 18 features',
      priority: 'low', 
      status: 'pending', 
      dueDate: '2024-01-20',
      taskType: 'personal',
      tags: ['learning', 'react'],
      xpValue: 25
    },
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

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'work': return 'primary';
      case 'personal': return 'secondary';
      case 'health': return 'success';
      case 'meeting': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Manage and track your daily tasks</p>
          </div>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4" />
                  Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">All Tasks</Badge>
                <Badge variant="secondary" size="sm">Pending</Badge>
                <Badge variant="success" size="sm">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <Badge variant={getTaskTypeColor(task.taskType) as 'default' | 'secondary' | 'primary' | 'success' | 'warning'} size="sm">
                          {task.taskType}
                        </Badge>
                        <Badge variant={getPriorityColor(task.priority) as 'default' | 'secondary' | 'warning' | 'error'} size="sm">
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          Due: {task.dueDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-primary">{task.xpValue} XP</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    {task.status !== 'completed' && (
                      <Button size="sm">
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline">
            Load More Tasks
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}

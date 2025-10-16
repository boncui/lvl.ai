'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategoryBanner } from '@/components/tasks';
import { TaskType, TaskPriority, TaskStatus } from '@/lib/types';
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
  // State for filtering
  const [selectedCategory, setSelectedCategory] = useState<TaskType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app, this would come from API
  const tasks = [
    { 
      id: 1, 
      title: 'Complete project proposal', 
      description: 'Finish the Q1 project proposal for the new feature',
      priority: TaskPriority.HIGH, 
      status: TaskStatus.IN_PROGRESS, 
      dueDate: '2024-01-15',
      taskType: TaskType.PROJECT,
      tags: ['work', 'urgent'],
      xpValue: 50
    },
    { 
      id: 2, 
      title: 'Grocery shopping', 
      description: 'Buy ingredients for the week',
      priority: TaskPriority.MEDIUM, 
      status: TaskStatus.PENDING, 
      dueDate: '2024-01-14',
      taskType: TaskType.FOOD,
      tags: ['shopping', 'food'],
      xpValue: 20
    },
    { 
      id: 3, 
      title: 'Morning workout', 
      description: '30-minute cardio session',
      priority: TaskPriority.HIGH, 
      status: TaskStatus.COMPLETED, 
      dueDate: '2024-01-13',
      taskType: TaskType.HEALTH,
      tags: ['fitness', 'morning'],
      xpValue: 30
    },
    { 
      id: 4, 
      title: 'Team meeting prep', 
      description: 'Prepare slides for the weekly team meeting',
      priority: TaskPriority.URGENT, 
      status: TaskStatus.PENDING, 
      dueDate: '2024-01-14',
      taskType: TaskType.MEETING,
      tags: ['work', 'presentation'],
      xpValue: 40
    },
    { 
      id: 5, 
      title: 'Read React documentation', 
      description: 'Study the new React 18 features',
      priority: TaskPriority.LOW, 
      status: TaskStatus.PENDING, 
      dueDate: '2024-01-20',
      taskType: TaskType.HOMEWORK,
      tags: ['learning', 'react'],
      xpValue: 25
    },
    { 
      id: 6, 
      title: 'Send follow-up email', 
      description: 'Follow up with client about project status',
      priority: TaskPriority.MEDIUM, 
      status: TaskStatus.PENDING, 
      dueDate: '2024-01-16',
      taskType: TaskType.EMAIL,
      tags: ['communication', 'client'],
      xpValue: 15
    },
    { 
      id: 7, 
      title: 'Coffee with Sarah', 
      description: 'Catch up with friend over coffee',
      priority: TaskPriority.LOW, 
      status: TaskStatus.PENDING, 
      dueDate: '2024-01-18',
      taskType: TaskType.SOCIAL,
      tags: ['friends', 'social'],
      xpValue: 10
    },
    { 
      id: 8, 
      title: 'Code review', 
      description: 'Review pull request for new feature',
      priority: TaskPriority.HIGH, 
      status: TaskStatus.IN_PROGRESS, 
      dueDate: '2024-01-15',
      taskType: TaskType.WORK,
      tags: ['development', 'review'],
      xpValue: 35
    },
    { 
      id: 9, 
      title: 'Organize desk', 
      description: 'Clean and organize workspace',
      priority: TaskPriority.LOW, 
      status: TaskStatus.PENDING, 
      dueDate: '2024-01-22',
      taskType: TaskType.PERSONAL,
      tags: ['organization', 'workspace'],
      xpValue: 15
    },
    { 
      id: 10, 
      title: 'Miscellaneous task', 
      description: 'Random task that doesn\'t fit other categories',
      priority: TaskPriority.MEDIUM, 
      status: TaskStatus.PENDING, 
      dueDate: '2024-01-19',
      taskType: TaskType.OTHER,
      tags: ['misc'],
      xpValue: 20
    },
  ];

  // Calculate task counts by category
  const taskCounts = useMemo(() => {
    const counts: Record<TaskType | 'all', number> = {
      all: tasks.length,
      [TaskType.FOOD]: 0,
      [TaskType.HOMEWORK]: 0,
      [TaskType.EMAIL]: 0,
      [TaskType.MEETING]: 0,
      [TaskType.PROJECT]: 0,
      [TaskType.PERSONAL]: 0,
      [TaskType.WORK]: 0,
      [TaskType.HEALTH]: 0,
      [TaskType.SOCIAL]: 0,
      [TaskType.OTHER]: 0,
    };

    tasks.forEach(task => {
      counts[task.taskType]++;
    });

    return counts;
  }, [tasks]);

  // Filter tasks based on selected category and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesCategory = selectedCategory === 'all' || task.taskType === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [tasks, selectedCategory, searchQuery]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT: return 'error';
      case TaskPriority.HIGH: return 'warning';
      case TaskPriority.MEDIUM: return 'default';
      case TaskPriority.LOW: return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return <CheckCircleIcon className="h-5 w-5 text-success" />;
      case TaskStatus.IN_PROGRESS: return <ClockIcon className="h-5 w-5 text-warning" />;
      case TaskStatus.PENDING: return <ExclamationTriangleIcon className="h-5 w-5 text-muted-foreground" />;
      case TaskStatus.CANCELLED: return <ExclamationTriangleIcon className="h-5 w-5 text-error" />;
      default: return null;
    }
  };

  const getTaskTypeColor = (taskType: TaskType) => {
    switch (taskType) {
      case TaskType.WORK: return 'primary';
      case TaskType.PERSONAL: return 'secondary';
      case TaskType.HEALTH: return 'success';
      case TaskType.MEETING: return 'warning';
      case TaskType.FOOD: return 'success';
      case TaskType.HOMEWORK: return 'primary';
      case TaskType.EMAIL: return 'secondary';
      case TaskType.PROJECT: return 'primary';
      case TaskType.SOCIAL: return 'warning';
      case TaskType.OTHER: return 'outline';
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Category Banner */}
        <Card>
          <CardContent className="p-6">
            <CategoryBanner
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              taskCounts={taskCounts}
            />
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'No tasks match your current filters.' 
                    : 'No tasks available.'}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{task.title}</h3>
                          <Badge variant={getTaskTypeColor(task.taskType) as 'default' | 'secondary' | 'primary' | 'success' | 'warning' | 'outline'} size="sm">
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
                      {task.status !== TaskStatus.COMPLETED && (
                        <Button size="sm">
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TaskPriority, TaskStatus } from '@/lib/types';
import { 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: {
    id: string | number;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    tags: string[];
    points: number;
  };
  onEdit?: (taskId: string | number) => void;
  onComplete?: (taskId: string | number) => void;
  onDelete?: (taskId: string | number) => void;
}

export function TaskCard({ task, onEdit, onComplete, onDelete }: TaskCardProps) {
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

  const getTagColor = (tag: string) => {
    const tagLower = tag.toLowerCase();
    switch (tagLower) {
      case 'work': return 'primary';
      case 'personal': return 'secondary';
      case 'health': return 'success';
      case 'meeting': return 'warning';
      case 'food': return 'success';
      case 'email': return 'secondary';
      case 'project': return 'primary';
      case 'social': return 'warning';
      case 'urgent': return 'error';
      case 'other': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {getStatusIcon(task.status)}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-foreground">{task.title}</h3>
                <Badge 
                  variant={getPriorityColor(task.priority) as 'default' | 'secondary' | 'warning' | 'error'} 
                  size="sm"
                >
                  {task.priority}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">{task.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Due: {task.dueDate || 'No due date'}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-primary">{task.points} Points</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {task.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant={getTagColor(tag) as 'default' | 'secondary' | 'primary' | 'success' | 'warning' | 'error' | 'outline'} 
                    size="sm"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(task.id)}
              >
                Edit
              </Button>
            )}
            {task.status !== TaskStatus.COMPLETED && onComplete && (
              <Button 
                size="sm"
                onClick={() => onComplete(task.id)}
              >
                Complete
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(task.id)}
                className="text-error hover:bg-error/10"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


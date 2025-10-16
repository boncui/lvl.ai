'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TaskCard } from './TaskCard';
import { TaskPriority, TaskStatus } from '@/lib/types';

interface TaskListProps {
  tasks: Array<{
    id: string | number;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    tags: string[];
    points: number;
  }>;
  isLoading?: boolean;
  onEdit?: (taskId: string | number) => void;
  onComplete?: (taskId: string | number) => void;
  onDelete?: (taskId: string | number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyMessage?: string;
}

export function TaskList({ 
  tasks, 
  isLoading = false,
  onEdit,
  onComplete,
  onDelete,
  onLoadMore,
  hasMore = false,
  emptyMessage = 'No tasks available.'
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="text-center mt-6">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Tasks
          </Button>
        </div>
      )}
    </>
  );
}


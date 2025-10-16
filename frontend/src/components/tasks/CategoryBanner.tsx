'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { TaskType } from '@/lib/types';

interface CategoryBannerProps {
  selectedCategory?: TaskType | 'all';
  onCategorySelect: (category: TaskType | 'all') => void;
  taskCounts?: Record<TaskType | 'all', number>;
  onAddTask?: (taskType: TaskType) => void;
}

const categoryConfig = {
  [TaskType.FOOD]: {
    label: 'Food',
    variant: 'success' as const,
    icon: '🍽️',
    description: 'Meal planning, cooking, dining'
  },
  [TaskType.HOMEWORK]: {
    label: 'Homework',
    variant: 'primary' as const,
    icon: '📚',
    description: 'Assignments, studying, research'
  },
  [TaskType.EMAIL]: {
    label: 'Email',
    variant: 'secondary' as const,
    icon: '📧',
    description: 'Communication, follow-ups'
  },
  [TaskType.MEETING]: {
    label: 'Meeting',
    variant: 'warning' as const,
    icon: '🤝',
    description: 'Team meetings, appointments'
  },
  [TaskType.PROJECT]: {
    label: 'Project',
    variant: 'primary' as const,
    icon: '🚀',
    description: 'Long-term projects, milestones'
  },
  [TaskType.PERSONAL]: {
    label: 'Personal',
    variant: 'secondary' as const,
    icon: '👤',
    description: 'Personal goals, hobbies'
  },
  [TaskType.WORK]: {
    label: 'Work',
    variant: 'default' as const,
    icon: '💼',
    description: 'Professional tasks, deadlines'
  },
  [TaskType.HEALTH]: {
    label: 'Health',
    variant: 'success' as const,
    icon: '🏃',
    description: 'Fitness, wellness, medical'
  },
  [TaskType.SOCIAL]: {
    label: 'Social',
    variant: 'warning' as const,
    icon: '👥',
    description: 'Social events, networking'
  },
  [TaskType.OTHER]: {
    label: 'Other',
    variant: 'outline' as const,
    icon: '📝',
    description: 'Miscellaneous tasks'
  },
  all: {
    label: 'All Tasks',
    variant: 'default' as const,
    icon: '📋',
    description: 'View all task categories'
  }
};

export function CategoryBanner({ selectedCategory = 'all', onCategorySelect, taskCounts = {} as Record<TaskType | 'all', number>, onAddTask }: CategoryBannerProps) {
  const categories = Object.values(TaskType) as TaskType[];
  
  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Task Categories</h3>
          <p className="text-sm text-muted-foreground">Filter tasks by category to stay organized</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {taskCounts?.all ? `${taskCounts.all} total tasks` : ''}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {/* All Tasks */}
        <button
          onClick={() => onCategorySelect('all')}
          className={`transition-all duration-200 hover:scale-105 ${
            selectedCategory === 'all' ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
        >
          <Badge 
            variant={categoryConfig.all.variant}
            size="lg"
            className="cursor-pointer hover:opacity-80 flex items-center gap-2 px-4 py-2"
          >
            <span className="text-base">{categoryConfig.all.icon}</span>
            <span className="font-medium">{categoryConfig.all.label}</span>
            {taskCounts.all && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {taskCounts.all}
              </span>
            )}
          </Badge>
        </button>

        {/* Individual Categories */}
        {categories.map((category) => {
          const config = categoryConfig[category];
          const count = taskCounts[category] || 0;
          const isSelected = selectedCategory === category;
          
          return (
            <div key={category} className="flex items-center gap-1">
              <button
                onClick={() => onCategorySelect(category)}
                className={`transition-all duration-200 hover:scale-105 ${
                  isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                <Badge 
                  variant={config.variant}
                  size="lg"
                  className="cursor-pointer hover:opacity-80 flex items-center gap-2 px-4 py-2"
                >
                  <span className="text-base">{config.icon}</span>
                  <span className="font-medium">{config.label}</span>
                  {count > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {count}
                    </span>
                  )}
                </Badge>
              </button>
              {onAddTask && (
                <button
                  onClick={() => onAddTask(category)}
                  className="ml-1 p-1 rounded-full hover:bg-primary/10 transition-colors"
                  title={`Add ${config.label} task`}
                >
                  <span className="text-sm text-muted-foreground hover:text-primary">+</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Category Description */}
      {selectedCategory !== 'all' && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {categoryConfig[selectedCategory as TaskType]?.icon}
            </span>
            <span className="font-medium text-foreground">
              {categoryConfig[selectedCategory as TaskType]?.label} Tasks
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {categoryConfig[selectedCategory as TaskType]?.description}
          </p>
        </div>
      )}
    </div>
  );
}


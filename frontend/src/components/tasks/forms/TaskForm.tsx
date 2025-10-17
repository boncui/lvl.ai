'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { TaskPriority, TaskStatus, CreateTaskDTO } from '@/lib/types';

interface TaskFormProps {
  initialTags?: string[];
  initialData?: CreateTaskDTO; // For editing existing tasks
  onSubmit: (data: CreateTaskDTO) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean; // To change button text
}

interface ValidationErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  taskTime?: string;
  points?: string;
}

export function TaskForm({ 
  initialTags = [], 
  initialData,
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  isEditing = false
}: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || TaskPriority.MEDIUM,
    status: initialData?.status || TaskStatus.PENDING,
    dueDate: initialData?.dueDate || '',
    taskTime: initialData?.taskTime || '',
    points: initialData?.points || 10,
    tags: initialData?.tags || initialTags,
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof CreateTaskDTO, value: any): string | undefined => {
    switch (field) {
      case 'title':
        if (!value || !value.trim()) {
          return 'Title is required';
        }
        if (value.trim().length < 3) {
          return 'Title must be at least 3 characters';
        }
        if (value.trim().length > 200) {
          return 'Title must be less than 200 characters';
        }
        break;
      
      case 'description':
        if (value && value.length > 1000) {
          return 'Description must be less than 1000 characters';
        }
        break;
      
      case 'points':
        const points = typeof value === 'string' ? parseInt(value) : value;
        if (isNaN(points)) {
          return 'Points must be a number';
        }
        if (points < 0) {
          return 'Points must be positive';
        }
        if (points > 10000) {
          return 'Points must be less than 10,000';
        }
        break;
      
      case 'dueDate':
        if (value && formData.taskTime) {
          const dueDate = new Date(value);
          const taskTime = new Date(formData.taskTime);
          if (dueDate < taskTime) {
            return 'Due date must be after task time';
          }
        }
        break;
      
      case 'taskTime':
        if (value && formData.dueDate) {
          const taskTime = new Date(value);
          const dueDate = new Date(formData.dueDate);
          if (taskTime > dueDate) {
            return 'Task time must be before due date';
          }
        }
        break;
    }
    return undefined;
  };

  const handleChange = (field: keyof CreateTaskDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Validate if field has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleBlur = (field: keyof CreateTaskDTO) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      handleChange('tags', [...(formData.tags || []), tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Validate all fields
    const titleError = validateField('title', formData.title);
    if (titleError) newErrors.title = titleError;
    
    const descError = validateField('description', formData.description);
    if (descError) newErrors.description = descError;
    
    const pointsError = validateField('points', formData.points);
    if (pointsError) newErrors.points = pointsError;
    
    const dueDateError = validateField('dueDate', formData.dueDate);
    if (dueDateError) newErrors.dueDate = dueDateError;
    
    const taskTimeError = validateField('taskTime', formData.taskTime);
    if (taskTimeError) newErrors.taskTime = taskTimeError;
    
    setErrors(newErrors);
    
    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      dueDate: true,
      taskTime: true,
      points: true,
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submitting
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          type="text"
          placeholder="Enter task title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          required
          disabled={isSubmitting}
          className={errors.title ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Enter task description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          rows={4}
          disabled={isSubmitting}
          className={errors.description ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Priority and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority ?? TaskPriority.MEDIUM}
            onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status ?? TaskStatus.PENDING}
            onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            <option value={TaskStatus.PENDING}>Pending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Task Time and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="taskTime" className="block text-sm font-medium text-gray-700 mb-2">
            Task Time (when it occurs)
          </label>
          <Input
            id="taskTime"
            type="datetime-local"
            value={typeof formData.taskTime === 'string' ? formData.taskTime : ''}
            onChange={(e) => handleChange('taskTime', e.target.value)}
            onBlur={() => handleBlur('taskTime')}
            disabled={isSubmitting}
            className={errors.taskTime ? 'border-red-500 focus:ring-red-500' : ''}
          />
          {errors.taskTime ? (
            <p className="text-red-500 text-sm mt-1">{errors.taskTime}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">When the task is scheduled to occur</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={typeof formData.dueDate === 'string' ? formData.dueDate : ''}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            onBlur={() => handleBlur('dueDate')}
            disabled={isSubmitting}
            className={errors.dueDate ? 'border-red-500 focus:ring-red-500' : ''}
          />
          {errors.dueDate ? (
            <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">When the task must be completed by</p>
          )}
        </div>
      </div>

      {/* Points */}
      <div>
        <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
          Points (XP Value)
        </label>
        <Input
          id="points"
          type="number"
          min="0"
          placeholder="10"
          value={formData.points ?? 10}
          onChange={(e) => handleChange('points', parseInt(e.target.value) || 0)}
          onBlur={() => handleBlur('points')}
          disabled={isSubmitting}
          className={errors.points ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {errors.points ? (
          <p className="text-red-500 text-sm mt-1">{errors.points}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">XP awarded when task is completed</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags (Categories)
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            id="tags"
            type="text"
            placeholder="Add a tag (e.g., work, personal, urgent)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            disabled={isSubmitting}
          />
          <Button 
            type="button" 
            onClick={handleAddTag} 
            variant="outline"
            disabled={isSubmitting || !tagInput.trim()}
          >
            Add
          </Button>
        </div>
        
        {/* Display Tags */}
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-600 focus:outline-none disabled:opacity-50"
                  disabled={isSubmitting}
                  aria-label={`Remove ${tag} tag`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Use tags to categorize your tasks (e.g., work, personal, health, food)
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Creating...') 
            : (isEditing ? 'Update Task' : 'Create Task')
          }
        </Button>
      </div>
    </form>
  );
}

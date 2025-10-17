'use client';

import React, { useEffect, useState } from 'react';
import { TaskForm } from '@/components/tasks/forms/TaskForm';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '@/lib/types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TaskAPI } from '@/lib/api';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null; // The task to edit
  onUpdated: (task: Task) => void;
}

function EditTaskModal({ isOpen, onClose, task, onUpdated }: EditTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (data: CreateTaskDTO) => {
    if (!task) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert CreateTaskDTO to UpdateTaskDTO (they have the same structure for updates)
      const updateData: UpdateTaskDTO = data;
      
      // Update the task via API
      const response = await TaskAPI.updateTask(task._id, updateData);
      
      // Parse dates for frontend use
      const updatedTask: Task = {
        ...response.data,
        taskTime: response.data.taskTime ? new Date(response.data.taskTime) : undefined,
        dueDate: response.data.dueDate ? new Date(response.data.dueDate) : undefined,
        completedAt: response.data.completedAt ? new Date(response.data.completedAt) : undefined,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };

      // Call the onUpdated callback
      onUpdated(updatedTask);
      
      // Close the modal
      onClose();
    } catch (err: any) {
      console.error('Error updating task:', err);
      
      // Extract error message from various sources
      let errorMessage = 'Failed to update task. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data.message === 'string') {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.errors) {
          // Handle validation errors object
          const errors = err.response.data.errors;
          errorMessage = Object.entries(errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !task) {
    return null;
  }

  // Prepare initial data from task for the form
  const initialData: CreateTaskDTO = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    taskTime: task.taskTime ? new Date(task.taskTime).toISOString().slice(0, 16) : '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    points: task.points,
    tags: task.tags || [],
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto w-full max-w-4xl shadow-xl border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Task
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update the details of your task
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error updating task</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6">
          <TaskForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;


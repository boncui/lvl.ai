import React from 'react';
import TaskCompletionGraph from '@/components/home/TaskCompletionGraph';

const TaskCompletionDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Completion Analytics</h1>
          <p className="mt-2 text-gray-600">
            Visualize your productivity and task completion patterns over time
          </p>
        </div>
        
        <TaskCompletionGraph />
      </div>
    </div>
  );
};

export default TaskCompletionDemo;

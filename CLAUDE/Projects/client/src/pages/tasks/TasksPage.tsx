import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/tasks/TaskList';
import AddTaskButton from '@/components/tasks/AddTaskButton';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    tasks, 
    loading, 
    error, 
    refetch 
  } = useTasks();
  
  const handleAddTask = () => {
    navigate('/tasks/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
          <span className="ml-3 text-text-primary">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-background py-6">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-text-primary mb-4">Tasks</h2>
            <button 
              onClick={handleAddTask}
              className="mb-4 px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-semibold rounded"
            >
              Add Task
            </button>
            <TaskList tasks={[]} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background py-6">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Tasks</h2>
          <button 
            onClick={handleAddTask}
            className="px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-semibold rounded"
          >
            Add Task
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-600">
            {error}
          </div>
        )}
        
        <div className="bg-card-background p-6 rounded-xl shadow-sm">
          <TaskList 
            tasks={tasks} 
            onRefresh={refetch} 
          />
        </div>
      </div>
    </div>
  );
};

export default TasksPage;

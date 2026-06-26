import React from 'react';
import { Task } from '@/types/task';
import { CheckCircle, Edit, Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (task: Task) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onEdit, 
  onDelete,
  onToggleStatus 
}) => {
  const handleToggleStatus = async () => {
    try {
      const updatedTask = {
        ...task,
        status: task.status === 'todo' ? 'in-progress' : 
                task.status === 'in-progress' ? 'done' : 'todo'
      };
      await onToggleStatus(updatedTask);
    } catch (error) {
      // Error handling will be done by the calling component
      console.error('Failed to toggle task status:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDelete(task.id);
      } catch (error) {
        // Error handling will be done by the calling component
        console.error('Failed to delete task:', error);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No due date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Priority color classes
  const getPriorityClass = (priority: Task['priority']): string => {
    switch (priority) {
      case 'high': return 'border-left-4 border-primary-orange';
      case 'medium': return 'border-left-4 border-primary-yellow';
      case 'low': return 'border-left-4 border-text-secondary/20';
      default: return 'border-left-4 border-text-secondary/20';
    }
  };

  // Status icon
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo': return <CheckCircle className="h-4 w-4 text-text-secondary" />;
      case 'in-progress': return <CheckCircle className="h-4 w-4 text-primary-orange" />;
      case 'done': return <CheckCircle className="h-4 w-4 text-primary-yellow" />;
      default: return <CheckCircle className="h-4 w-4 text-text-secondary" />;
    }
  };

  return (
    <div className="flex p-4 bg-card-background rounded-xl shadow-sm border-l-4">
      <div className={`flex-shrink-0 ${getPriorityClass(task.priority)} p-2`}>
        {getStatusIcon(task.status)}
      </div>
      <div className="flex-1 pl-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-text-primary">{task.title}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(task)}
              className="text-text-hover hover:text-primary-orange"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={handleDelete}
              className="text-text-hover hover:text-primary-orange"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {task.description && (
          <p className="text-text-secondary mb-2 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-2">
            <span className="text-text-secondary">Due: </span>
            <span className="font-medium">{formatDate(task.dueDate)}</span>
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium">
            {task.status === 'todo' && 'bg-primary-orange/10 text-primary-orange'}
            {task.status === 'in-progress' && 'bg-primary-yellow/10 text-primary-yellow'}
            {task.status === 'done' && 'bg-text-secondary/10 text-text-secondary'}
            {task.status === 'todo' && 'To Do'}
            {task.status === 'in-progress' && 'In Progress'}
            {task.status === 'done' && 'Done'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

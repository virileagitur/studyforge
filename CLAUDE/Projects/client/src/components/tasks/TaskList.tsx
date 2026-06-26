import React from 'react';
import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (task: Task) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onEdit, 
  onDelete,
  onToggleStatus 
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No tasks found. Click "Add Task" to create your first task.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default TaskList;

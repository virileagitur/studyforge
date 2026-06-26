import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { TaskFormData } from '@/types/task';

interface TaskFormProps {
  // If editing, the task ID would be in the URL params
  // If creating, no task ID is needed
}

const TaskForm: React.FC<TaskFormProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isEditing } = useParams<{ isEditing: string }>(); // Alternative approach
  
  const { 
    createTask, 
    updateTask, 
    loading, 
    error 
  } = useTasks();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo'
  });
  
  // If editing, fetch the task data to populate the form
  // useEffect(() => {
  //   if (id) {
  //     // Fetch task by ID and populate form
  //   }
  // }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (id) {
        // Update existing task
        await updateTask(id, formData);
      } else {
        // Create new task
        await createTask(formData);
      }
      
      // Navigate back to tasks list
      navigate(-1);
    } catch (err: any) {
      // Error handling will be done by the hook
      console.error('Failed to save task:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      dueDate: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-card-background p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {id ? 'Edit Task' : 'Add Task'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="Enter task title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="Enter task description (optional)"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleDateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-text-secondary hover:bg-text-secondary/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-bold rounded-md disabled:opacity-50`}
            >
              {loading ? 'Saving...' : (id ? 'Update Task' : 'Add Task')}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskForm;

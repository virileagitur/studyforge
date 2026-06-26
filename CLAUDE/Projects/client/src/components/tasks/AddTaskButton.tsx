import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface AddTaskButtonProps {
  // No specific props needed for now
}

const AddTaskButton: React.FC<AddTaskButtonProps> = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/tasks/new');
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center space-x-2 px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-semibold rounded hover:shadow-md transition-shadow"
    >
      <Plus className="h-4 w-4" />
      <span>Add Task</span>
    </button>
  );
};

export default AddTaskButton;

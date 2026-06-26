import React, { useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, loading, error, refetch } = useTasks();
  const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;

  // Calculate stats from tasks
  const tasksDueToday = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate === today && task.status !== 'done';
  }).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;

  // Handle add task button click
  const handleAddTask = () => {
    navigate('/tasks/new');
  };

  // Refresh data periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) {
    return (
      <div className='min-h-screen bg-light-background py-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange'></div>
          <span className='ml-3 text-text-primary'>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-light-background py-6'>
        <div className='max-w-2xl mx-auto p-6'>
          <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6'>
            <p className='text-red-600'>Error: {error}</p>
          </div>
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-bold text-text-primary mb-4'>Dashboard</h2>
            <button
              onClick={refetch}
              className='mt-4 px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-semibold rounded'
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-light-background py-6'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold text-text-primary'>
          Welcome back, {parsedUser?.name || 'User'}!
        </h1>
      </header>
      <main className='max-w-4xl mx-auto px-4'>
        {/* Stats cards */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='bg-card-background p-6 rounded-xl shadow-sm'>
            <h3 className='font-semibold text-text-primary mb-2'>Tasks Due Today</h3>
            <p className='text-2xl font-bold text-primary-orange'>{tasksDueToday}</p>
          </div>
          <div className='bg-card-background p-6 rounded-xl shadow-sm'>
            <h3 className='font-semibold text-text-primary mb-2'>Flashcards to Review</h3>
            {/* Placeholder for flashcard data */}
            <p className='text-2xl font-bold text-primary-yellow'>0</p>
          </div>
          <div className='bg-card-background p-6 rounded-xl shadow-sm'>
            <h3 className='font-semibold text-text-primary mb-2'>Study Hours</h3>
            {/* Placeholder for study hours data */}
            <p className='text-2xl font-bold text-primary-orange'>0 hrs</p>
          </div>
          <div className='bg-card-background p-6 rounded-xl shadow-sm'>
            <h3 className='font-semibold text-text-primary mb-2'>Books Read</h3>
            {/* Placeholder for books data */}
            <p className='text-2xl font-bold text-primary-yellow'>0</p>
          </div>
        </div>

        {/* Task overview section */}
        <div className='mt-8'>
          <h2 className='text-xl font-semibold text-text-primary mb-4'>Task Overview</h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='bg-card-background p-4 rounded-lg'>
              <h3 className='font-medium text-text-primary mb-2'>Total Tasks</h3>
              <p className='text-xl font-bold text-text-primary'>{totalTasks}</p>
            </div>
            <div className='bg-card-background p-4 rounded-lg'>
              <h3 className='font-medium text-text-primary mb-2'>Completed</h3>
              <p className='text-xl font-bold text-primary-orange'>{completedTasks}</p>
            </div>
            <div className='bg-card-background p-4 rounded-lg'>
              <h3 className='font-medium text-text-primary mb-2'>In Progress</h3>
              <p className='text-xl font-bold text-primary-yellow'>{inProgressTasks}</p>
            </div>
            <div className='bg-card-background p-4 rounded-lg'>
              <h3 className='font-medium text-text-primary mb-2'>To Do</h3>
              <p className='text-xl font-bold text-text-primary'>{todoTasks}</p>
            </div>
          </div>
        </div>

        {/* Recent tasks */}
        {!loading && tasks.length > 0 && (
          <div className='mt-8'>
            <h2 className='text-xl font-semibold text-text-primary mb-4'>Recent Tasks</h2>
            <div className='space-y-4'>
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className='p-4 bg-white rounded-lg shadow-sm flex justify-between items-start'>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-text-primary'>{task.title}</h3>
                    <p className='text-sm text-text-secondary'>
                      {task.description ? task.description.substring(0, 50) + (task.description.length > 50 ? '...' : '') : 'No description'}
                    </p>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'todo' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                      {task.priority && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='text-right'>
                    {task.dueDate && (
                      <p className='text-xs text-text-secondary'>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length > 5 && (
                <div className='text-center text-text-secondary'>
                  <p>And {tasks.length - 5} more tasks...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className='mt-8'>
            <h2 className='text-xl font-semibold text-text-primary mb-4'>Recent Tasks</h2>
            <div className='text-center py-8'>
              <p className='text-text-secondary'>No tasks yet. Create your first task to get started!</p>
              <button
                onClick={handleAddTask}
                className='mt-4 px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-semibold rounded'
              >
                Add First Task
              </button>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className='mt-8'>
          <h2 className='text-xl font-semibold text-text-primary mb-4'>Quick Actions</h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <button
              onClick={handleAddTask}
              className='bg-primary-orange hover:bg-primary-orange-light text-white font-bold py-2 px-4 rounded'
            >
              Add Task
            </button>
            <button className='bg-primary-yellow hover:bg-primary-yellow-light text-text-primary font-bold py-2 px-4 rounded'>
              Add Research
            </button>
            <button className='bg-primary-orange hover:bg-primary-orange-light text-white font-bold py-2 px-4 rounded'>
              Add Book
            </button>
            <button className='bg-primary-yellow hover:bg-primary-yellow-light text-text-primary font-bold py-2 px-4 rounded'>
              Create Flashcards
            </button>
          </div>
        </div>

        {/* Placeholder for recent activity */}
        <div className='mt-8'>
          <h2 className='text-xl font-semibold text-text-primary mb-4'>Recent Activity</h2>
          <div className='space-y-4'>
            {/* Activity items will go here */}
            <div className='text-text-secondary'>No recent activity yet.</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
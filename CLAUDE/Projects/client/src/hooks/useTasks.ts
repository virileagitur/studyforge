import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api';
import { Task } from '../../client/src/types/task';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '' as 'todo' | 'in-progress' | 'done' | '',
    priority: '' as 'low' | 'medium' | 'high' | '',
    search: '',
  });

  // Fetch tasks based on current filters
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Pass filters as query parameters
      const response = await taskAPI.getTasks(filters);
      setTasks(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch tasks when filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: '',
      priority: '',
      search: '',
    });
  }, []);

  // Create a new task
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await taskAPI.createTask(taskData);
      // Optimistically update the tasks list
      setTasks(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create task');
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (id: string, taskData: Partial<Task>) => {
    try {
      const response = await taskAPI.updateTask(id, taskData);
      // Update the task in the list
      setTasks(prev =>
        prev.map(task => task.id === id ? response.data : task)
      );
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update task');
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskAPI.deleteTask(id);
      // Remove the task from the list
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete task');
    }
  }, []);

  // Get a single task by ID
  const getTask = useCallback(async (id: string) => {
    try {
      const response = await taskAPI.getTaskById(id);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch task');
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTask
  };
};

export default useTasks;
import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';

// Get all tasks for a user with optional filtering/sorting
export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Extract query parameters for filtering/sorting
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as string,
      limit: req.query.limit as string
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    const tasks = await Task.findByUserId(userId, filters);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get a single task by ID
export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const task = await Task.findById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { title, description, dueDate, priority, status } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const task = new Task({
      userId,
      title,
      description,
      dueDate,
      priority,
      status
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// Update an existing task
export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const taskId = req.params.id;
    const { title, description, dueDate, priority, status } = req.body;
    
    // Find the existing task
    const existingTask = await Task.findById(taskId, userId);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update the task with new values
    const updatedTask = new Task({
      ...existingTask,
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      dueDate: dueDate !== undefined ? dueDate : existingTask.dueDate,
      priority: priority !== undefined ? priority : existingTask.priority,
      status: status !== undefined ? status : existingTask.status
    });
    
    await updatedTask.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const taskId = req.params.id;
    const deleted = await Task.deleteById(taskId, userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

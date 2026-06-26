import { Router } from 'express';
import { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All routes are protected
router.use(protect);

// GET /api/tasks - Get all tasks (with filtering/sorting)
router.get('/', getTasks);

// GET /api/tasks/:id - Get a specific task
router.get('/:id', getTaskById);

// POST /api/tasks - Create a new task
router.post('/', createTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

export default router;

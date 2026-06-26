import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { initializeDatabase } from './models/User';
import { initializeTasksTable } from './models/Task';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    console.log('Raw body:', buf.toString());
  },
}));

// Initialize database
initializeDatabase().catch(console.error);
initializeTasksTable().catch(console.error);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'StudyForge API is running!' });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Task routes
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

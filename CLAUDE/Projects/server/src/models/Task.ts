import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../config/database';

// Define the TaskRow type for database rows
interface TaskRow {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export class Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.title = data.title;
    this.description = data.description;
    this.dueDate = data.dueDate;
    this.priority = data.priority || 'medium';
    this.status = data.status || 'todo';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Save task to database
  async save(): Promise<Task> {
    const now = new Date().toISOString();
    
    if (!this.id) {
      // Insert new task
      const sql = `
        INSERT INTO tasks (id, userId, title, description, dueDate, priority, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        this.id,
        this.userId,
        this.title,
        this.description || null,
        this.dueDate || null,
        this.priority,
        this.status,
        now,
        now
      ];
      
      const result = await run(sql, params);
      this.id = this.id || (result as any).id;
    } else {
      // Update existing task
      const sql = `
        UPDATE tasks 
        SET title = ?, description = ?, dueDate = ?, priority = ?, status = ?, updatedAt = ?
        WHERE id = ? AND userId = ?
      `;
      
      const params = [
        this.title,
        this.description || null,
        this.dueDate || null,
        this.priority,
        this.status,
        new Date().toISOString(),
        this.id,
        this.userId
      ];
      
      await run(sql, params);
    }
    
    this.updatedAt = new Date();
    return this;
  }

  // Find tasks by user ID with optional filtering
  static async findByUserId(userId: string, filters: any = {}): Promise<Task[]> {
    let sql = 'SELECT * FROM tasks WHERE userId = ?';
    const params: any[] = [userId];
    
    // Add filters if provided
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Add sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    // Add limit if specified
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    const rows = await query(sql, params);
    return rows.map((row: any) => new Task(row));
  }

  // Find task by ID and user ID
  static async findById(id: string, userId: string): Promise<Task | null> {
    const sql = 'SELECT * FROM tasks WHERE id = ? AND userId = ?';
    const params = [id, userId];
    const row = await get(sql, params) as TaskRow | null;
    
    if (!row) {
      return null;
    }
    
    return new Task(row);
  }

  // Delete task by ID and user ID
  static async deleteById(id: string, userId: string): Promise<boolean> {
    const sql = 'DELETE FROM tasks WHERE id = ? AND userId = ?';
    const params = [id, userId];
    const result = await run(sql, params);
    return (result as any).changes > 0;
  }
}

// Initialize tasks table
export const initializeTasksTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'todo',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await query(createTableQuery);
    console.log('Tasks table checked/created successfully');
  } catch (error) {
    console.error('Error creating tasks table:', error);
    throw error;
  }
};

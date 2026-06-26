import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcryptjs';
import { query, get, run } from '../config/database';

// Define the UserRow type for database rows
interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string;
  school_grade: string;
  subjects: string | string[]; // Could be string (JSON) from DB or array
  created_at: string | Date;
  updated_at: string | Date;
}

export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  school_grade: string;
  subjects: string[];
  created_at: Date;
  updated_at: Date;

  constructor(data: any) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.password = data.password;
    this.name = data.name || '';
    this.school_grade = data.school_grade || '';
    // Ensure subjects is an array; if it's a string (from DB), parse it
    this.subjects = Array.isArray(data.subjects)
      ? data.subjects
      : data.subjects
      ? JSON.parse(data.subjects)
      : [];
    this.created_at = data.created_at
      ? new Date(data.created_at)
      : new Date();
    this.updated_at = data.updated_at
      ? new Date(data.updated_at)
      : new Date();
  }

  // Save user to database
  async save(): Promise<User> {
    // Hash password if it's not already hashed
    let hashedPassword = this.password;
    if (!this.password.startsWith('$2b$')) {
      hashedPassword = await hash(this.password, 10);
    }

    // Convert subjects array to JSON string for storage
    const subjectsJson = JSON.stringify(this.subjects);

    const sql = `
      INSERT INTO users (id, email, password, name, school_grade, subjects, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const params: any[] = [
      this.id,
      this.email,
      hashedPassword,
      this.name,
      this.school_grade,
      subjectsJson,
    ];

    const result = await run(sql, params);
    this.id = this.id || (result as any).lastID;
    return this;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const params: any[] = [email];
    const row = await get(sql, params) as UserRow | null;

    if (!row) {
      return null;
    }

    // Parse the subjects JSON string
    const userData = {
      ...row,
      subjects: Array.isArray(row.subjects) ? row.subjects : JSON.parse(row.subjects as string),
      created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at as string),
      updated_at: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at as string)
    };

    return new User(userData);
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const params: any[] = [id];
    const row = await get(sql, params) as UserRow | null;

    if (!row) {
      return null;
    }

    // Parse the subjects JSON string
    const userData = {
      ...row,
      subjects: Array.isArray(row.subjects) ? row.subjects : JSON.parse(row.subjects as string),
      created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at as string),
      updated_at: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at as string)
    };

    return new User(userData);
  }

  // Compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await compare(candidatePassword, this.password);
  }
}

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create users table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        school_grade TEXT,
        subjects TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(createTableQuery);
    console.log('Users table checked/created successfully');

    // Create an admin user if it doesn't exist
    const adminEmail = 'admin@studyforge.com';
    const existingAdmin = await User.findByEmail(adminEmail);

    if (!existingAdmin) {
      const adminUser = new User({
        email: adminEmail,
        password: 'admin123', // In a real app, this should be changed immediately
        name: 'Administrator',
      });

      await adminUser.save();
      console.log('Admin user created: admin@studyforge.com / admin123');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default User;
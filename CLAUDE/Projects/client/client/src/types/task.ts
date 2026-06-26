export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
}

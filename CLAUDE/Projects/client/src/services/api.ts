import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Task APIs
export const taskAPI = {
  getTasks: (params: any = {}) => api.get('/tasks', { params }),
  getTaskById: (id: string) => api.get(`/tasks/${id}`),
  createTask: (taskData: any) => api.post('/tasks', taskData),
  updateTask: (id: string, taskData: any) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
};

// Bookmark APIs
export const bookmarkAPI = {
  getBookmarks: (params: any = {}) => api.get('/bookmarks', { params }),
  getBookmarkById: (id: string) => api.get(`/bookmarks/${id}`),
  createBookmark: (bookmarkData: any) => api.post('/bookmarks', bookmarkData),
  updateBookmark: (id: string, bookmarkData: any) => api.put(`/bookmarks/${id}`, bookmarkData),
  deleteBookmark: (id: string) => api.delete(`/bookmarks/${id}`),
};

import axios from 'axios';

// Create axios instance
const api = axios.interceptors.request: any) => {
      // Log the request
      console.log('Starting Request', JSON.stringify(config, null, 2));
      return config;
    });
  },
.response: {
.onfulfilled: (response: any) => {
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response;
    },
.onrejected: (error: any) => {
      console.error('Response Error:', error);
      return Promise.reject(error);
    }
  }
})
});

export default api;

// Create a specialized API service for tasks
export const taskAPI = {
  getTasks: (filters: Record<string, any> = {}) => {
    return api.get('/api/tasks', { params: filters });
  },

  getTask: (id: string) => {
    return api.get(`/api/tasks/${id}`);
  },

  createTask: (taskData: any) => {
    return api.post('/api/tasks', taskData);
  },

  updateTask: (id: string, taskData: any) => {
    return api.put(`/api/tasks/${id}`, taskData);
  },

  deleteTask: (id: string) => {
    return api.delete(`/api/tasks/${id}`);
  }
};
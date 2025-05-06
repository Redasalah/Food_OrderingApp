import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Configure axios with default options
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add logging for debugging
const logRequest = (context, data) => {
  console.log(`[${context}] Request:`, data);
};

const logResponse = (context, response) => {
  console.log(`[${context}] Response:`, response);
};

const logError = (context, error) => {
  console.error(`[${context}] Error:`, error.response || error.message || error);
};

const authApi = {
  // Login user - MUST use POST method
  login: async (email, password) => {
    logRequest('login', { email, password: '******' });
    
    try {
      // Explicitly use POST method
      const response = await api.post('/auth/login', { email, password });
      logResponse('login', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      logError('login', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to login. Please try again.' 
      };
    }
  },

  // Register user - MUST use POST method
  register: async (userData) => {
    logRequest('register', { ...userData, password: '******' });
    
    try {
      // Explicitly use POST method
      const response = await api.post('/auth/register', userData);
      logResponse('register', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      logError('register', error);
      
      if (error.response?.status === 400 && error.response?.data) {
        // Handle validation errors
        if (typeof error.response.data === 'object' && !error.response.data.message) {
          const validationErrors = error.response.data;
          return { success: false, validationErrors };
        }
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to register. Please try again.' 
      };
    }
  },
  
  // Check auth status - safely use GET method
  checkStatus: async () => {
    try {
      const response = await api.get('/auth/status');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check auth status.' 
      };
    }
  }
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default authApi;
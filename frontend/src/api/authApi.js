import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const authApi = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to login. Please try again.' 
      };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return { success: true, data: response.data };
    } catch (error) {
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
  }
};

export default authApi;
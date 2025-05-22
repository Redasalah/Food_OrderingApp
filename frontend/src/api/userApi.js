// src/api/userApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/user';

const userApi = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user profile' 
      };
    }
  },
  
  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await axios.put(
        `${API_URL}/profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      // Handle validation errors
      if (error.response?.status === 400 && error.response?.data) {
        if (typeof error.response.data === 'object' && !error.response.data.message) {
          return { success: false, validationErrors: error.response.data };
        }
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update user profile' 
      };
    }
  }
};

export default userApi;
// frontend/src/api/restaurantApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';
const PUBLIC_API_URL = 'http://localhost:8080/api/public/restaurants';

// Helper function to log errors
const logError = (error, context) => {
  console.error(`RestaurantAPI Error (${context}):`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });
};

const restaurantApi = {
  // Get all restaurants with optional filters (public endpoint)
  getAllRestaurants: async (filters = {}) => {
    try {
      const response = await axios.get(PUBLIC_API_URL, { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'getAllRestaurants');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch restaurants. Please try again.' 
      };
    }
  },

  // Get a specific restaurant by ID (public endpoint)
  getRestaurantById: async (id) => {
    try {
      const response = await axios.get(`${PUBLIC_API_URL}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'getRestaurantById');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch restaurant details.' 
      };
    }
  },




// Add this method to restaurantApi
getRestaurantOrders: async (restaurantId, status = null) => {
  try {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        restaurantId: restaurantId,
        ...(status ? { status } : {})
      }
    };
    
    const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/orders`, config);
    
    console.log('Restaurant Orders Response:', response.data);
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error) {
    console.error('Error fetching restaurant orders:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch restaurant orders' 
    };
  }
},

 
  // Get restaurants owned by the logged-in user (protected endpoint)
  getMyRestaurants: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await axios.get(
        `${API_URL}/restaurants/owner`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'getMyRestaurants');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch your restaurants.' 
      };
    }
  },
  
  // Create a new restaurant (protected endpoint)
  createRestaurant: async (restaurantData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      console.log('Creating restaurant with data:', restaurantData);
      
      const response = await axios.post(
        `${API_URL}/restaurants/create`,
        restaurantData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'createRestaurant');
      
      // Extract validation errors if available
      if (error.response?.status === 400 && error.response?.data) {
        if (typeof error.response.data === 'object' && !error.response.data.message) {
          return { success: false, validationErrors: error.response.data };
        }
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create restaurant. Please try again.' 
      };
    }
  },
  
  // Update an existing restaurant (protected endpoint)
  updateRestaurant: async (restaurantId, restaurantData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await axios.put(
        `${API_URL}/restaurants/${restaurantId}`,
        restaurantData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'updateRestaurant');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update restaurant. Please try again.' 
      };
    }
  },
  
  // Delete a restaurant (protected endpoint)
  deleteRestaurant: async (restaurantId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await axios.delete(
        `${API_URL}/restaurants/${restaurantId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'deleteRestaurant');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete restaurant. Please try again.' 
      };
    }
  }
};

export default restaurantApi;
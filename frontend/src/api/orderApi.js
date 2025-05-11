// src/api/orderApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/orders';

// Helper function to handle API errors
const handleApiError = (error, context) => {
  console.error(`OrderAPI Error (${context}):`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });

  return { 
    success: false, 
    error: error.response?.data?.message || `Failed to ${context}. Please try again.`
  };
};

const orderApi = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(API_URL, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      return handleApiError(error, 'create order');
    }
  },
  
  // Get user's orders (with optional status filter)
  getUserOrders: async (status = null) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: status ? { status } : {}
      };
      
      const response = await axios.get(API_URL, config);
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      return handleApiError(error, 'fetch orders');
    }
  },
  
  // Get a specific order by ID
  getOrderById: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      return handleApiError(error, 'fetch order details');
    }
  },
  
  // Cancel an order
  cancelOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_URL}/${orderId}/cancel`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      return handleApiError(error, 'cancel order');
    }
  }
};

export default orderApi;
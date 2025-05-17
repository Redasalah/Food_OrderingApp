// src/api/orderApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/orders';

// Order status mapping for consistent frontend representation
export const ORDER_STATUS_MAP = {
  PENDING: { 
    label: 'Order Received', 
    description: 'Your order has been placed and is being processed',
    color: 'text-info'
  },
  PROCESSING: { 
    label: 'Preparing', 
    description: 'Restaurant is preparing your order',
    color: 'text-warning'
  },
  READY_FOR_PICKUP: { 
    label: 'Ready for Pickup', 
    description: 'Your order is ready to be picked up or delivered',
    color: 'text-success'
  },
  OUT_FOR_DELIVERY: { 
    label: 'Out for Delivery', 
    description: 'Your order is on its way',
    color: 'text-primary'
  },
  COMPLETED: { 
    label: 'Delivered', 
    description: 'Order has been successfully delivered',
    color: 'text-success'
  },
  CANCELLED: { 
    label: 'Cancelled', 
    description: 'Order was cancelled',
    color: 'text-danger'
  }
};

// Helper function to handle API errors
const handleApiError = (error, context) => {
  console.error(`OrderAPI Error (${context}):`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });

  return { 
    success: false, 
    error: error.response?.data?.message || `Failed to ${context}. Please try again.`,
    details: error.response?.data
  };
};

const orderApi = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Enhanced logging and validation
      console.log('Order Creation Request:', orderData);

      // Comprehensive data validation
      if (!orderData.restaurantId) {
        throw new Error('Restaurant ID is required');
      }
      if (!orderData.orderItems || orderData.orderItems.length === 0) {
        throw new Error('At least one order item is required');
      }

      const response = await axios.post(API_URL, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Order Creation Response:', response.data);
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Order Creation Full Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create order. Please try again.',
        details: error.response?.data
      };
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
      
      // Sort orders by most recent first
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      return { 
        success: true, 
        data: sortedOrders
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
  },

  // Get order status information
  getOrderStatusInfo: (status) => {
    return ORDER_STATUS_MAP[status] || {
      label: 'Unknown Status',
      description: 'Status not recognized',
      color: 'text-secondary'
    };
  }
};

export default orderApi;
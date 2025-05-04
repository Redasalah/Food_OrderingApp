// frontend/src/api/menuItemApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const menuItemApi = {
  // Create a new menu item (Restaurant staff only)
  createMenuItem: async (restaurantId, menuItemData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/restaurants/${restaurantId}/menu-items`,
        menuItemData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating menu item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create menu item. Please try again.' 
      };
    }
  },
  
  // Get menu items for a restaurant (Public endpoint)
  getMenuItems: async (restaurantId) => {
    try {
      const response = await axios.get(`${API_URL}/public/restaurants/${restaurantId}/menu-items`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load menu items.' 
      };
    }
  },
  
  // Update a menu item (Restaurant staff only)
  updateMenuItem: async (menuItemId, menuItemData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/menu-items/${menuItemId}`,
        menuItemData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating menu item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update menu item. Please try again.' 
      };
    }
  },
  
  // Delete a menu item (Restaurant staff only)
  deleteMenuItem: async (menuItemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/menu-items/${menuItemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete menu item. Please try again.' 
      };
    }
  }
};

export default menuItemApi;
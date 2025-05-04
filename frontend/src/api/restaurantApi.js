import axios from 'axios';

const API_URL = 'http://localhost:8080/api/public/restaurants';

// Helper function to log errors
const logError = (error, context) => {
  console.error(`RestaurantAPI Error (${context}):`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });
};

const restaurantApi = {
  // Get all restaurants with optional filters
  getAllRestaurants: async (filters = {}) => {
    try {
      const response = await axios.get(API_URL, { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'getAllRestaurants');
      
      // Mock data for development (remove in production)
      const mockData = [
        {
          id: '1',
          name: 'Pizza Paradise',
          cuisine: 'Italian',
          rating: 4.8,
          deliveryTime: '25-35 min',
          deliveryFee: 2.99,
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          priceRange: '$$'
        },
        {
          id: '2',
          name: 'Burger Bliss',
          cuisine: 'American',
          rating: 4.5,
          deliveryTime: '15-25 min',
          deliveryFee: 1.99,
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          priceRange: '$$'
        },
        {
          id: '3',
          name: 'Sushi Sensation',
          cuisine: 'Japanese',
          rating: 4.9,
          deliveryTime: '35-45 min',
          deliveryFee: 3.99,
          imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          priceRange: '$$$'
        },
        {
          id: '4',
          name: 'Taco Time',
          cuisine: 'Mexican',
          rating: 4.6,
          deliveryTime: '20-30 min',
          deliveryFee: 2.49,
          imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          priceRange: '$'
        },
        {
          id: '5',
          name: 'Pho Delight',
          cuisine: 'Vietnamese',
          rating: 4.7,
          deliveryTime: '25-40 min',
          deliveryFee: 2.99,
          imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          priceRange: '$$'
        },
        {
          id: '6',
          name: 'Curry House',
          cuisine: 'Indian',
          rating: 4.8,
          deliveryTime: '30-45 min',
          deliveryFee: 3.49,
          imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          priceRange: '$$'
        }
      ];
      
      console.log('Using mock data for restaurants');
      return { success: true, data: mockData };
    }
  },

  // Get a specific restaurant by ID
  getRestaurantById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'getRestaurantById');
      
      // Mock data for development (remove in production)
      const mockRestaurant = {
        id: id,
        name: 'Pizza Paradise',
        cuisine: 'Italian',
        rating: 4.8,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        priceRange: '$$',
        address: '123 Main St, Anytown, USA',
        hours: '10:00 AM - 10:00 PM',
        description: 'Pizza Paradise offers authentic Italian pizzas made with the freshest ingredients. Our dough is made fresh daily and we use only the finest cheeses and toppings.',
        menu: [
          {
            id: 'm1',
            category: 'Pizzas',
            items: [
              {
                id: 'p1',
                name: 'Margherita',
                description: 'Classic pizza with tomato sauce, mozzarella, fresh basil, salt, and olive oil',
                price: 12.99,
                imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                popular: true
              },
              {
                id: 'p2',
                name: 'Pepperoni',
                description: 'Classic pizza topped with tomato sauce, mozzarella, and pepperoni slices',
                price: 14.99,
                imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                popular: true
              }
            ]
          },
          {
            id: 'm2',
            category: 'Sides',
            items: [
              {
                id: 's1',
                name: 'Garlic Bread',
                description: 'Crispy bread with garlic butter and herbs',
                price: 4.99,
                imageUrl: '',
                popular: true
              }
            ]
          }
        ]
      };
      
      console.log('Using mock data for restaurant detail');
      return { success: true, data: mockRestaurant };
    }
  },

  // Get restaurant menu
  getRestaurantMenu: async (restaurantId) => {
    try {
      const response = await axios.get(`${API_URL}/${restaurantId}/menu`);
      return { success: true, data: response.data };
    } catch (error) {
      logError(error, 'getRestaurantMenu');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load restaurant menu.' 
      };
    }
  }
};

export default restaurantApi;
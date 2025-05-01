// src/pages/RestaurantListing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/RestaurantListing.css';

// This would be replaced with actual API calls
const mockRestaurants = [
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

const RestaurantListing = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: '',
    sortBy: 'rating'
  });

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchRestaurants = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setRestaurants(mockRestaurants);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const filteredRestaurants = restaurants
    .filter(restaurant => {
      // Filter by cuisine
      if (filters.cuisine && restaurant.cuisine !== filters.cuisine) {
        return false;
      }

      // Filter by price range
      if (filters.priceRange && restaurant.priceRange !== filters.priceRange) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (filters.sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (filters.sortBy === 'deliveryTime') {
        // Extract first number from delivery time range
        const aTime = parseInt(a.deliveryTime.split('-')[0]);
        const bTime = parseInt(b.deliveryTime.split('-')[0]);
        return aTime - bTime;
      } else if (filters.sortBy === 'deliveryFee') {
        return a.deliveryFee - b.deliveryFee;
      }
      return 0;
    });

  // Get unique cuisines for filter
  const cuisines = [...new Set(restaurants.map(r => r.cuisine))];
  
  // Get unique price ranges for filter
  const priceRanges = [...new Set(restaurants.map(r => r.priceRange))];

  return (
    <>
      
      <div className="restaurant-listing-container">
        <div className="restaurant-listing-header">
          <h1>Restaurants Near You</h1>
          <p>Discover the best food in your area</p>
        </div>

        <div className="restaurant-filter-section">
          <div className="filter-group">
            <label htmlFor="cuisine">Cuisine</label>
            <select 
              id="cuisine" 
              name="cuisine" 
              value={filters.cuisine} 
              onChange={handleFilterChange}
            >
              <option value="">All Cuisines</option>
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priceRange">Price Range</label>
            <select 
              id="priceRange" 
              name="priceRange" 
              value={filters.priceRange} 
              onChange={handleFilterChange}
            >
              <option value="">All Prices</option>
              {priceRanges.map(price => (
                <option key={price} value={price}>{price}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select 
              id="sortBy" 
              name="sortBy" 
              value={filters.sortBy} 
              onChange={handleFilterChange}
            >
              <option value="rating">Rating</option>
              <option value="deliveryTime">Delivery Time</option>
              <option value="deliveryFee">Delivery Fee</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading restaurants...</p>
          </div>
        ) : (
          <div className="restaurant-grid">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map(restaurant => (
                <Link 
                  to={`/restaurants/${restaurant.id}`} 
                  className="restaurant-card" 
                  key={restaurant.id}
                >
                  <div 
                    className="restaurant-image" 
                    style={{ backgroundImage: `url(${restaurant.imageUrl})` }}
                  />
                  <div className="restaurant-details">
                    <h3>{restaurant.name}</h3>
                    <p className="cuisine">{restaurant.cuisine}</p>
                    <div className="restaurant-meta">
                      <span className="rating">★ {restaurant.rating}</span>
                      <span className="price-range">{restaurant.priceRange}</span>
                    </div>
                    <div className="delivery-info">
                      <span className="delivery-time">{restaurant.deliveryTime}</span>
                      <span className="delivery-fee">${restaurant.deliveryFee.toFixed(2)} delivery</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-results">
                <p>No restaurants found matching your criteria.</p>
                <button 
                  className="reset-filters"
                  onClick={() => setFilters({ cuisine: '', priceRange: '', sortBy: 'rating' })}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
     
    </>
  );
};

export default RestaurantListing;
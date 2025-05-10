// src/pages/RestaurantListing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/RestaurantListing.css';

const RestaurantListing = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: '',
    sortBy: 'rating'
  });

  useEffect(() => {
    // Fetch real restaurants from the API
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        console.log('Fetching real restaurants from API...');
        
        const response = await axios.get('http://localhost:8080/api/public/restaurants');
        console.log('API Response:', response.data);
        
        if (response.data) {
          setRestaurants(response.data);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('Failed to load restaurants. Please try again later.');
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

  // Filter and sort restaurants based on user selections
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
        return (b.rating || 0) - (a.rating || 0);
      } else if (filters.sortBy === 'deliveryTime') {
        // Extract first number from delivery time range (or use 30 as default)
        const getMinutes = (timeString) => {
          const match = timeString?.match(/\d+/);
          return match ? parseInt(match[0]) : 30;
        };
        return getMinutes(a.deliveryTime) - getMinutes(b.deliveryTime);
      } else if (filters.sortBy === 'deliveryFee') {
        return (a.deliveryFee || 0) - (b.deliveryFee || 0);
      }
      return 0;
    });

  // Get unique cuisines for filter
  const cuisines = [...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];
  
  // Get unique price ranges for filter
  const priceRanges = [...new Set(restaurants.map(r => r.priceRange).filter(Boolean))];

  if (loading) {
    return (
      <>
        <div className="restaurant-listing-container">
          <div className="loading-state">
            <p>Loading restaurants...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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

        {filteredRestaurants.length > 0 ? (
          <div className="restaurant-grid">
            {filteredRestaurants.map(restaurant => (
              <Link 
                to={`/restaurants/${restaurant.id}`} 
                className="restaurant-card" 
                key={restaurant.id}
              >
                <div 
                  className="restaurant-image" 
                  style={{ backgroundImage: `url(${restaurant.imageUrl || 'https://via.placeholder.com/500x300'})` }}
                />
                <div className="restaurant-details">
                  <h3>{restaurant.name}</h3>
                  <p className="cuisine">{restaurant.cuisine}</p>
                  <div className="restaurant-meta">
                    <span className="rating">★ {restaurant.rating || '0.0'}</span>
                    <span className="price-range">{restaurant.priceRange || '$'}</span>
                  </div>
                  <div className="delivery-info">
                    <span className="delivery-time">{restaurant.deliveryTime || '30-45 min'}</span>
                    <span className="delivery-fee">${(restaurant.deliveryFee || 2.99).toFixed(2)} delivery</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
      <Footer />
    </>
  );
};

export default RestaurantListing;
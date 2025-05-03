import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import restaurantApi from '../api/restaurantApi';
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
    // Fetch restaurants on component mount
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantApi.getAllRestaurants();
      
      if (response.success) {
        setRestaurants(response.data);
      } else {
        setError('Failed to load restaurants. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchRestaurants}>
            Try Again
          </button>
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
  );
};

export default RestaurantListing;
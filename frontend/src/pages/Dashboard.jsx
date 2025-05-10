import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inside your useEffect in Dashboard.jsx
useEffect(() => {
  const fetchRestaurants = async () => {
    try {
      console.log('Starting to fetch restaurants...');
      
      // Direct API call with extensive logging
      const response = await axios.get('http://localhost:8080/api/public/restaurants');
      
      console.log('Full API Response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log('Data is an array with', response.data.length, 'items');
          setRestaurants(response.data);
        } else {
          console.log('Data is not an array, it is:', typeof response.data);
          
          // Check if it's wrapped in a property
          const possibleArrayProperties = ['data', 'restaurants', 'items', 'results'];
          
          for (const prop of possibleArrayProperties) {
            if (response.data[prop] && Array.isArray(response.data[prop])) {
              console.log(`Found array in response.data.${prop} with`, response.data[prop].length, 'items');
              setRestaurants(response.data[prop]);
              break;
            }
          }
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      setError('Failed to load restaurants. Please check the console for details.');
      setLoading(false);
    }
  };

  fetchRestaurants();
}, []);
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'User'}</h1>
        <p>Find your favorite food from our top restaurants</p>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/restaurants" className="action-button">
              <i className="fas fa-utensils"></i>
              <span>Browse Restaurants</span>
            </Link>
            <Link to="/orders" className="action-button">
              <i className="fas fa-list"></i>
              <span>Your Orders</span>
            </Link>
            <Link to="/profile" className="action-button">
              <i className="fas fa-user"></i>
              <span>Your Profile</span>
            </Link>
          </div>
        </div>

        <div className="featured-restaurants">
          <h2>Featured Restaurants</h2>
          {restaurants.length > 0 ? (
            <div className="restaurant-grid">
              {restaurants.map(restaurant => (
                <Link to={`/restaurants/${restaurant.id}`} className="restaurant-card" key={restaurant.id}>
                  <div 
                    className="restaurant-image-placeholder"
                    style={{
                      backgroundImage: restaurant.imageUrl ? `url(${restaurant.imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <p>Cuisine: {restaurant.cuisine}</p>
                    <p>⭐ {restaurant.rating || '0.0'}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-data-message">No restaurants available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
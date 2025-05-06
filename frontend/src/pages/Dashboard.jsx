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

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axios.get('http://localhost:8080/api/public/restaurants');
        setRestaurants(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
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
              {/* This is just placeholder content - replace with your actual data */}
              <div className="restaurant-card">
                <div className="restaurant-image-placeholder"></div>
                <div className="restaurant-info">
                  <h3>Sample Restaurant</h3>
                  <p>Cuisine: Italian</p>
                  <p>⭐ 4.5 (120 reviews)</p>
                </div>
              </div>
              <div className="restaurant-card">
                <div className="restaurant-image-placeholder"></div>
                <div className="restaurant-info">
                  <h3>Another Restaurant</h3>
                  <p>Cuisine: Chinese</p>
                  <p>⭐ 4.2 (85 reviews)</p>
                </div>
              </div>
              {/* End of placeholder content */}
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
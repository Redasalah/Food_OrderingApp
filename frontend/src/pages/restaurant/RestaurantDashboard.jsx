// frontend/src/pages/restaurant/RestaurantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/restaurant/RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an API call to fetch the user's restaurants
        // For now, we'll simulate with a mock endpoint
        const response = await axios.get(`http://localhost:8080/api/restaurants/owner/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // If API is not ready, use this mock data for development
        if (!response.data || response.data.length === 0) {
          console.log('No restaurants found for this user');
          // If user has no restaurants, redirect to create restaurant page
          navigate('/restaurant/create');
          return;
        }
        
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        
        // For development purposes, check if it's a 404 (no restaurants)
        if (err.response && err.response.status === 404) {
          navigate('/restaurant/create');
          return;
        }
        
        setError('Failed to load your restaurants. Please try again later.');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [user.id, navigate]);

  if (loading) {
    return (
      <div className="restaurant-dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-dashboard-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <Link to="/restaurant/create" className="btn btn-primary">
            Create Restaurant
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-dashboard-container">
      <div className="dashboard-header">
        <h1>Restaurant Dashboard</h1>
        <p>Manage your restaurant and menu items</p>
      </div>

      <div className="restaurant-stats-container">
        <div className="stat-card">
          <h3>Orders Today</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">$0.00</p>
        </div>
        <div className="stat-card">
          <h3>Menu Items</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Customer Rating</h3>
          <p className="stat-value">No ratings yet</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/restaurant/menu" className="action-button">
            <i className="fas fa-utensils"></i>
            <span>Manage Menu</span>
          </Link>
          <Link to="/restaurant/orders" className="action-button">
            <i className="fas fa-clipboard-list"></i>
            <span>Process Orders</span>
          </Link>
          <Link to="/restaurant/settings" className="action-button">
            <i className="fas fa-cog"></i>
            <span>Restaurant Settings</span>
          </Link>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        <div className="no-orders-message">
          <p>No recent orders to display.</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
// src/pages/restaurant/RestaurantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import restaurantApi from '../../api/restaurantApi';
import '../../styles/restaurant/RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user's restaurants on component mount
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantApi.getMyRestaurants();
        
        if (response.success) {
          setRestaurants(response.data);
          console.log('Fetched restaurants:', response.data);
        } else {
          console.error('Failed to fetch restaurants:', response.error);
          setError(response.error || 'Failed to load your restaurants.');
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="restaurant-dashboard-container">
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }

  // If error occurred, show error message
  if (error) {
    return (
      <div className="restaurant-dashboard-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no restaurants, show create restaurant button
  if (restaurants.length === 0) {
    return (
      <div className="restaurant-dashboard-container">
        <div className="dashboard-header">
          <h1>Restaurant Dashboard</h1>
          <p>Welcome, {user?.name || 'Restaurant Owner'}!</p>
        </div>
        
        <div className="no-restaurants-message">
          <h2>You don't have any restaurants yet</h2>
          <p>Create your first restaurant to start managing your business</p>
          
          <Link to="/restaurant/create" className="create-restaurant-button">
            Create Restaurant
          </Link>
        </div>
      </div>
    );
  }

  // Display the user's restaurants
  return (
    <div className="restaurant-dashboard-container">
      <div className="dashboard-header">
        <h1>Restaurant Dashboard</h1>
        <p>Welcome, {user?.name || 'Restaurant Owner'}!</p>
      </div>
      
      <div className="restaurant-stats-container">
        <div className="stat-card">
          <h3>Restaurants</h3>
          <div className="stat-value">{restaurants.length}</div>
        </div>
        
        <div className="stat-card">
          <h3>Menu Items</h3>
          <div className="stat-value">
            {restaurants.reduce((total, restaurant) => {
              return total + (restaurant.menuItems?.length || 0);
            }, 0)}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Orders Today</h3>
          <div className="stat-value">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Earnings</h3>
          <div className="stat-value">$0.00</div>
        </div>
      </div>
      
      <div className="restaurants-list">
        <div className="section-header">
          <h2>Your Restaurants</h2>
          <Link to="/restaurant/create" className="add-restaurant-button">
            Add Restaurant
          </Link>
        </div>
        
        <div className="restaurant-cards">
          {restaurants.map(restaurant => (
            <div className="restaurant-card" key={restaurant.id}>
              <div 
                className="restaurant-image" 
                style={{ 
                  backgroundImage: restaurant.imageUrl 
                    ? `url(${restaurant.imageUrl})` 
                    : 'linear-gradient(to right, #ff8c00, #ff4500)' 
                }}
              />
              
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p className="cuisine">{restaurant.cuisine}</p>
                <p className="address">{restaurant.address}</p>
                <div className="restaurant-status">
                  <span className={`status-badge ${restaurant.active ? 'active' : 'inactive'}`}>
                    {restaurant.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="restaurant-actions">
                <button 
                  className="action-button view"
                  onClick={() => navigate(`/restaurant/menu?id=${restaurant.id}`)}
                >
                  Manage Menu
                </button>
                
                <button 
                  className="action-button edit"
                  onClick={() => navigate(`/restaurant/settings?id=${restaurant.id}`)}
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/restaurant/menu" className="action-button">
            <span>Manage Menus</span>
          </Link>
          <Link to="/restaurant/orders" className="action-button">
            <span>Process Orders</span>
          </Link>
          <Link to="/restaurant/settings" className="action-button">
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
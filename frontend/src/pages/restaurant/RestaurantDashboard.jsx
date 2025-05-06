// src/pages/restaurant/RestaurantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/restaurant/RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectToCreate, setRedirectToCreate] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch data from your API
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For demo purposes, let's check if restaurant exists
        // In a real app, you would fetch this from your API
        const mockRestaurantExists = false; // Set to false to force creation flow
        
        if (!mockRestaurantExists) {
          // If no restaurant exists, set redirect flag
          setRedirectToCreate(true);
        } else {
          // Mock data for development purposes
          const mockRestaurant = {
            id: 1,
            name: "Your Restaurant",
            cuisine: "Mixed",
            address: "123 Main Street",
            createdAt: new Date().toISOString()
          };
          
          setRestaurantData(mockRestaurant);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, []);

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="restaurant-dashboard-container">
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }

  // If no restaurant profile exists, redirect to create page
  if (redirectToCreate) {
    return <Navigate to="/restaurant/create" replace />;
  }

  // Rest of your dashboard component...
  return (
    <div className="restaurant-dashboard-container">
      <div className="dashboard-header">
        <h1>Restaurant Dashboard</h1>
        <p>Welcome, {user?.name || 'Restaurant Owner'}!</p>
      </div>
      
      {/* Display restaurant information */}
      <div className="restaurant-info">
        <h2>{restaurantData.name}</h2>
        <p>Type: {restaurantData.cuisine}</p>
        <p>Address: {restaurantData.address}</p>
      </div>
      
      {/* Rest of your dashboard content... */}
      <div className="quick-actions">
        <h2>Restaurant Management</h2>
        <div className="action-buttons">
          <Link to="/restaurant/menu" className="action-button">
            <span>Manage Menu</span>
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
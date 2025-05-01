// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check if a specific role is required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to the appropriate dashboard based on user role
    if (user.role === 'CUSTOMER') {
      return <Navigate to="/dashboard" />;
    } else if (user.role === 'RESTAURANT_STAFF') {
      return <Navigate to="/restaurant/restaurantdashboard" />;
    } else if (user.role === 'DELIVERY_PERSONNEL') {
      return <Navigate to="/delivery-dashboard" />;
    }
  }
  
  // Render children if authenticated and has required role (or no specific role is required)
  return children;
};

export default ProtectedRoute;
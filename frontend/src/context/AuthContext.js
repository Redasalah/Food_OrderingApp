import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import authApi from '../api/authApi';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Set authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('User authenticated from localStorage:', userData);
    } else {
      console.log('No stored authentication found');
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await authApi.login(email, password);
      
      if (response.success) {
        console.log('Login successful:', response.data);
        
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        };
        
        // Store user and token in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        
        // Set authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        console.error('Login failed:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'An unexpected error occurred. Please try again.' 
      };
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      console.log('Attempting registration for:', userData.email);
      const response = await authApi.register(userData);
      
      if (response.success) {
        console.log('Registration successful');
        return { success: true };
      } else {
        console.error('Registration failed:', response.error);
        if (response.validationErrors) {
          return { success: false, validationErrors: response.validationErrors };
        }
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'An unexpected error occurred. Please try again.' 
      };
    }
  };
  
  // Logout function
  const logout = () => {
    console.log('Logging out user');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/login';
    
    console.log('Getting dashboard URL for role:', user.role);
    
    switch (user.role) {
      case 'RESTAURANT_STAFF':
        return '/restaurant/dashboard';
      case 'DELIVERY_PERSONNEL':
        return '/delivery/dashboard';
      default:
        return '/dashboard';
    }
  };
  
  // Create the context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    getDashboardUrl
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
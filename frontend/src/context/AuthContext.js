import React, { createContext, useState, useContext, useEffect } from 'react';
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
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success) {
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        };
        
        // Store user and token in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      
      if (response.success) {
        return { success: true };
      } else {
        if (response.validationErrors) {
          return { success: false, validationErrors: response.validationErrors };
        }
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'RESTAURANT_STAFF':
        return '/restaurant/dashboard';
      case 'DELIVERY_PERSONNEL':
        return '/delivery/dashboard';
      default:
        return '/dashboard';
    }
  };
  
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
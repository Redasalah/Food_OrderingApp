// src/components/RestaurantNavbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/RestaurantNavbar.css';

const RestaurantNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="restaurant-navbar">
      <div className="navbar-container">
        <Link to="/restaurant/dashboard" className="navbar-logo">
          Quicky <span className="restaurant-badge">Restaurant</span>
        </Link>
        
        <div 
          className="navbar-mobile-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className={`burger-icon ${isMenuOpen ? 'open' : ''}`}></span>
        </div>
        
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link 
              to="/restaurant/dashboard" 
              className={`navbar-link ${isActive('/restaurant/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/restaurant/menu" 
              className={`navbar-link ${isActive('/restaurant/menu') ? 'active' : ''}`}
            >
              Menu Management
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/restaurant/orders" 
              className={`navbar-link ${isActive('/restaurant/orders') ? 'active' : ''}`}
            >
              Orders
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/restaurant/settings" 
              className={`navbar-link ${isActive('/restaurant/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
          </li>
          <li className="navbar-item user-profile">
            <div className="navbar-profile">
              <span className="navbar-username">{user?.name || 'Restaurant Partner'}</span>
              <button className="navbar-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default RestaurantNavbar;
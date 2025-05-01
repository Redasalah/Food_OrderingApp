// src/components/RestaurantNavbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/RestaurantNavbar.css';

const RestaurantNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <nav className="restaurant-navbar">
      <div className="navbar-container">
        <Link to="/restaurant/dashboard" className="navbar-logo">
          UberDontEat <span className="restaurant-badge">Restaurant</span>
        </Link>
        
        <div className="navbar-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className={`burger-icon ${isMenuOpen ? 'open' : ''}`}></span>
        </div>
        
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/restaurant/dashboard" className="navbar-link">
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/restaurant/menu" className="navbar-link">
              Menu Management
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/restaurant/orders" className="navbar-link">
              Orders
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/restaurant/settings" className="navbar-link">
              Settings
            </Link>
          </li>
          <li className="navbar-item">
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
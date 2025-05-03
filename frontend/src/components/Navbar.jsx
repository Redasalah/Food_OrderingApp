// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartIcon from './CartIcon';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Determine which logo and style to show based on user role
  const getLogo = () => {
    const baseLogo = "Quicky";
    
    if (!user) return baseLogo;
    
    switch (user.role) {
      case 'RESTAURANT_STAFF':
        return (
          <>
            {baseLogo} <span className="role-badge restaurant">Restaurant</span>
          </>
        );
      case 'DELIVERY_PERSONNEL':
        return (
          <>
            {baseLogo} <span className="role-badge delivery">Delivery</span>
          </>
        );
      default:
        return baseLogo;
    }
  };

  const renderNavItems = () => {
    // If no user is logged in, show login/signup
    if (!user) {
      return (
        <>
          <li className="navbar-item">
            <Link to="/login" className={`navbar-link ${isActive('/login') ? 'active' : ''}`}>
              Login
            </Link>
          </li>
          <li className="navbar-item">
          <Link to="/restaurants" className="navbar-link">
  Restaurants
</Link></li>
          <li className="navbar-item">
            <Link to="/signup" className={`navbar-link ${isActive('/signup') ? 'active' : ''}`}>
              Sign Up
            </Link>
          </li>
          
        </>
      );
    }

    // Customer navigation items
    if (user.role === 'CUSTOMER') {
      return (
        <>
          <li className="navbar-item">
            <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/restaurants" className={`navbar-link ${isActive('/restaurants') ? 'active' : ''}`}>
              Restaurants
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/cart" className={`navbar-link ${isActive('/cart') ? 'active' : ''}`}>
              <CartIcon />
            </Link>
          </li>
        </>
      );
    }

    // Restaurant staff navigation items
    if (user.role === 'RESTAURANT_STAFF') {
      return (
        <>
          <li className="navbar-item">
            <Link to="/Restaurant/dashboard" className={`navbar-link ${isActive('/Restaurant/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/Restaurant/menu" className={`navbar-link ${isActive('/Restaurant/menu') ? 'active' : ''}`}>
              Menu
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/Restaurant/orders" className={`navbar-link ${isActive('/Restaurant/orders') ? 'active' : ''}`}>
              Orders
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/Restaurant/settings" className={`navbar-link ${isActive('/Restaurant/settings') ? 'active' : ''}`}>
              Settings
            </Link>
          </li>
        </>
      );
    }

    // Delivery personnel navigation items
    if (user.role === 'DELIVERY_PERSONNEL') {
      return (
        <>
          <li className="navbar-item">
            <Link to="/Delivery/dashboard" className={`navbar-link ${isActive('/Delivery/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/Delivery/available-orders" className={`navbar-link ${isActive('/Delivery/available-orders') ? 'active' : ''}`}>
              Available Orders
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/Delivery/order-history" className={`navbar-link ${isActive('/Delivery/order-history') ? 'active' : ''}`}>
              Order History
            </Link>
          </li>
        </>
      );
    }

    return null;
  };

  return (
    <nav className={`navbar ${user?.role?.toLowerCase() || ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          {getLogo()}
        </Link>
        
        <div className="navbar-mobile-toggle" onClick={toggleMenu}>
          <span className={`burger-icon ${isMenuOpen ? 'open' : ''}`}></span>
        </div>
        
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {renderNavItems()}
          
          {user && (
            <li className="navbar-item user-profile">
              <div className="navbar-profile">
                <span className="navbar-username">{user.name}</span>
                <button 
                  className="navbar-logout" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
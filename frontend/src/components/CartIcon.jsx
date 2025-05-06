import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/CartIcon.css';

const CartIcon = () => {
  try {
    // Get cart context
    const cartContext = useCart();
    
    // Safely access totalItems with a fallback
    const totalItems = cartContext?.totalItems || 0;
    
    return (
      <Link to="/cart" className="cart-icon-wrapper">
        <i className="fas fa-shopping-cart"></i>
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
      </Link>
    );
  } catch (error) {
    console.error('CartIcon error:', error);
    // Return a simple cart icon without badge if context is missing
    return (
      <Link to="/cart" className="cart-icon-wrapper">
        <i className="fas fa-shopping-cart"></i>
      </Link>
    );
  }
};

export default CartIcon;
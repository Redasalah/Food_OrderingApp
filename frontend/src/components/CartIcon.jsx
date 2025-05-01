import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/CartIcon.css';

const CartIcon = () => {
  const { totalItems } = useCart();
  
  return (
    <Link to="/cart" className="cart-icon-container">
      <div className="cart-icon">
        <i className="fas fa-shopping-cart"></i>
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;
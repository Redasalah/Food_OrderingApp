// src/components/Cart.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + deliveryFee + tax;
  
  // Group items by restaurant
  const itemsByRestaurant = items.reduce((acc, item) => {
    const restaurantName = item.restaurantInfo?.name || 'Unknown Restaurant';
    if (!acc[restaurantName]) {
      acc[restaurantName] = [];
    }
    acc[restaurantName].push(item);
    return acc;
  }, {});
  
  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="empty-cart-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/restaurants" className="browse-restaurants-button">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Cart</h1>
        <button 
          onClick={clearCart}
          className="clear-cart-button"
        >
          Clear Cart
        </button>
      </div>
      
      {Object.entries(itemsByRestaurant).map(([restaurantName, restaurantItems]) => (
        <div key={restaurantName} className="restaurant-cart-section">
          <h2 className="restaurant-name">
            <i className="fas fa-utensils"></i> {restaurantName}
          </h2>
          
          {restaurantItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-details">
                <div className="cart-item-image-container">
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/100'} 
                    alt={item.name} 
                    className="cart-item-image"
                  />
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button 
                    className="quantity-button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="remove-item-button"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
      
      <div className="cart-summary">
        <div className="cart-summary-section">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        <Link to="/checkout" className="checkout-button">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;
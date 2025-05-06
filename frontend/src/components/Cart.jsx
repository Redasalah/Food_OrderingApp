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
  
  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h3>Your cart is empty</h3>
          <p>Add some delicious items to your cart from our restaurants.</p>
          <Link to="/restaurants" className="browse-restaurants-button">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-details">
              <h4>{item.name}</h4>
              <p className="cart-item-price">${item.price.toFixed(2)}</p>
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
                className="remove-button"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Tax</span>
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
      
      <button 
        onClick={clearCart}
        className="browse-restaurants-button"
        style={{ backgroundColor: '#ccc', marginTop: '1rem' }}
      >
        Clear Cart
      </button>
    </div>
  );
};

export default Cart;
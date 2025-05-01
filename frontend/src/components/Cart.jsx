import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length > 0) {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your Cart</h2>
        <div className="cart-empty">
          <h3>Your cart is empty</h3>
          <p>Add some delicious items to your cart!</p>
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
              <p className="cart-item-price">${(item.price).toFixed(2)}</p>
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
          <span>$2.99</span>
        </div>
        <div className="cart-summary-row">
          <span>Tax</span>
          <span>${(subtotal * 0.08).toFixed(2)}</span>
        </div>
        <div className="cart-summary-row total">
          <span>Total</span>
          <span>${(subtotal + 2.99 + (subtotal * 0.08)).toFixed(2)}</span>
        </div>
      </div>
      <button 
        className="checkout-button"
        onClick={handleCheckout}
        disabled={items.length === 0}
      >
        Proceed to Checkout
      </button>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button 
          onClick={clearCart}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#ff4757', 
            textDecoration: 'underline',
            cursor: 'pointer' 
          }}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

export default Cart;
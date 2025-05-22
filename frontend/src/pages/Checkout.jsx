// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderApi from '../api/orderApi';
import '../styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;
  
  // Group items by restaurant
  const itemsByRestaurant = items.reduce((acc, item) => {
    const restaurantId = item.restaurantInfo?.id || 'unknown';
    if (!acc[restaurantId]) {
      acc[restaurantId] = {
        restaurantInfo: item.restaurantInfo,
        items: []
      };
    }
    acc[restaurantId].items.push(item);
    return acc;
  }, {});
  
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    phoneNumber: '',   
    specialInstructions: '',
    paymentMethod: 'CREDIT_CARD',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    }  if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid phone number';
    }
    
    
    if (formData.paymentMethod === 'CREDIT_CARD') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      
      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Expiry date must be in MM/YY format';
      }
      
      if (!formData.cardCvc.trim()) {
        newErrors.cardCvc = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
        newErrors.cardCvc = 'CVC must be 3 or 4 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Ensure we have items and a restaurant
        if (items.length === 0) {
          throw new Error('Cart is empty');
        }
      
        
        const orderRequest = {
          restaurantId: items[0].restaurantInfo.id,
          orderItems: items.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || ''
          })),
          deliveryAddress: formData.deliveryAddress,
          specialInstructions: formData.specialInstructions || '',
          paymentMethod: formData.paymentMethod
        };
        
        console.log('Submitting Order:', orderRequest);
        
        const response = await orderApi.createOrder(orderRequest);
        
        if (response.success) {
          // Clear cart and navigate to confirmation
          clearCart();
          navigate('/order-confirmation', { 
            state: { order: response.data } 
          });
        } else {
          // Handle order creation error
          setErrors({
            submit: response.error || 'Failed to place order. Please try again.'
          });
        }
      } catch (error) {
        console.error('Unexpected Order Creation Error:', error);
        setErrors({
          submit: 'An unexpected error occurred. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="checkout-container">
        <h1>Checkout</h1>
        <div className="empty-cart-message">
          <p>Your cart is empty. Please add items to your cart before checking out.</p>
          <button onClick={() => navigate('/restaurants')} className="browse-button">
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }
  
  if (orderSuccess) {
    return (
      <div className="checkout-container">
        <div className="order-success">
          <h1>Order Placed Successfully!</h1>
          <p>Redirecting to order confirmation...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <div className="checkout-content">
        <div className="checkout-form-container">
          {errors.submit && <div className="error-message form-error">{errors.submit}</div>}
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Delivery Information</h2>
              
              <div className="form-group">
                <label htmlFor="deliveryAddress">Delivery Address*</label>
                <input
                  type="text"
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  className={errors.deliveryAddress ? 'input-error' : ''}
                  placeholder="Enter your full address"
                />
                {errors.deliveryAddress && <div className="error-message">{errors.deliveryAddress}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Any special instructions for delivery"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="form-group">
  <label htmlFor="phoneNumber">Phone Number*</label>
  <input
    type="tel"
    id="phoneNumber"
    name="phoneNumber"
    value={formData.phoneNumber}
    onChange={handleChange}
    className={errors.phoneNumber ? 'input-error' : ''}
    placeholder="e.g. +1 555-123-4567"
  />
  {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
</div>

            
            <div className="form-section">
              <h2>Payment Method</h2>
              
              <div className="payment-options">
                <div 
                  className={`payment-option ${formData.paymentMethod === 'CREDIT_CARD' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    id="creditCard"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={formData.paymentMethod === 'CREDIT_CARD'}
                    onChange={handleChange}
                  />
                  <label htmlFor="creditCard">Credit/Debit Card</label>
                </div>
                
                <div 
                  className={`payment-option ${formData.paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    id="cashOnDelivery"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={handleChange}
                  />
                  <label htmlFor="cashOnDelivery">Cash on Delivery</label>
                </div>
              </div>
              
              {formData.paymentMethod === 'CREDIT_CARD' && (
                <div className="card-details">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number*</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'input-error' : ''}
                    />
                    {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cardExpiry">Expiry Date*</label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={errors.cardExpiry ? 'input-error' : ''}
                      />
                      {errors.cardExpiry && <div className="error-message">{errors.cardExpiry}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cardCvc">CVC*</label>
                      <input
                        type="text"
                        id="cardCvc"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleChange}
                        placeholder="123"
                        className={errors.cardCvc ? 'input-error' : ''}
                      />
                      {errors.cardCvc && <div className="error-message">{errors.cardCvc}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="place-order-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          {Object.entries(itemsByRestaurant).map(([restaurantId, { restaurantInfo, items }]) => (
            <div key={restaurantId} className="restaurant-order">
              <h3>{restaurantInfo?.name || 'Unknown Restaurant'}</h3>
              
              <div className="order-items">
                {items.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="item-quantity">{item.quantity}x</div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      {item.specialInstructions && (
                        <div className="item-instructions">{item.specialInstructions}</div>
                      )}
                    </div>
                    <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="order-totals">
            <div className="order-total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="order-total-row">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="order-total-row">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="order-total-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
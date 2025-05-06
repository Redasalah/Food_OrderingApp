// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';
import '../styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
 
  // src/pages/Checkout.jsx
const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate order totals using cart context data
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + deliveryFee + tax;

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
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'phone'];
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Validate card details if paying by card
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Invalid card number';
      }
      
      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Use format MM/YY';
      }
      
      if (!formData.cardCvc.trim()) {
        newErrors.cardCvc = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
        newErrors.cardCvc = 'Invalid CVC';
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
        // In a real app, this would make an API call to process the order
        console.log('Order data:', { orderItems: items, ...formData, total });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clear the cart after successful order
        clearCart();
        
        // Navigate to order confirmation page
        navigate('/order-confirmation');
      } catch (error) {
        console.error('Error processing order:', error);
        setErrors({
          form: 'Failed to process your order. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Check if cart is empty
  if (items.length === 0) {
    return (
      <>
        
        <div className="checkout-container">
          <div className="empty-cart-message">
            <h2>Your cart is empty</h2>
            <p>Add some delicious items to your cart before checking out.</p>
            <button 
              onClick={() => navigate('/restaurants')}
              className="browse-restaurants-button"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form-container">
            {errors.form && <div className="error-message">{errors.form}</div>}
            
            <form onSubmit={handleSubmit} className="checkout-form">
              <h2>Delivery Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'input-error' : ''}
                  />
                  {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'input-error' : ''}
                  />
                  {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'input-error' : ''}
                />
                {errors.address && <div className="error-message">{errors.address}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'input-error' : ''}
                  />
                  {errors.city && <div className="error-message">{errors.city}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={errors.postalCode ? 'input-error' : ''}
                  />
                  {errors.postalCode && <div className="error-message">{errors.postalCode}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>
              
              <h2>Payment Method</h2>
              <div className="payment-options">
                <div className="payment-option">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <label htmlFor="card">Credit/Debit Card</label>
                </div>
                
                <div className="payment-option">
                  <input
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                  />
                  <label htmlFor="cash">Cash on Delivery</label>
                </div>
              </div>
              
              {formData.paymentMethod === 'card' && (
                <div className="card-details">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
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
                      <label htmlFor="cardExpiry">Expiry Date</label>
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
                      <label htmlFor="cardCvc">CVC</label>
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
            <div className="order-items">
  {items.map(item => (
    <div key={item.id} className="order-item">
      <div className="item-left">
        <div className="item-controls">
          <button 
            className="quantity-button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="order-item-quantity">{item.quantity}</span>
          <button 
            className="quantity-button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>
        <div className="order-item-name">{item.name}</div>
      </div>
      <div className="item-right">
        <div className="order-item-price">${(item.price * item.quantity).toFixed(2)}</div>
        <button 
          className="remove-button"
          onClick={() => removeItem(item.id)}
        >
          ✕
        </button>
      </div>
    </div>
  ))}
</div>
            
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
      <Footer />
    </>
  );
};

export default Checkout;
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getDashboardUrl } = useAuth();
  
  // Check if there's a message in location state (e.g., from registration)
  const [message, setMessage] = useState(location.state?.message || '');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    
    // Clear success message when user starts typing
    if (message) {
      setMessage('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Use the login function from AuthContext
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          // Use the getDashboardUrl function to navigate to the appropriate dashboard
          navigate(getDashboardUrl());
        } else {
          setErrors({
            form: result.error || 'Invalid email or password. Please try again.'
          });
        }
      } catch (error) {
        console.error('Error logging in:', error);
        setErrors({
          form: 'An unexpected error occurred. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Helper text to instruct users on role-based login
  const loginHelperText = (
    <div className="login-helper-text">
      <p>Demo Login Credentials:</p>
      <ul>
        <li>Customer: any email without "delivery" or "restaurant" (e.g., user@example.com)</li>
        <li>Delivery Personnel: any email containing "delivery" (e.g., delivery@example.com)</li>
        <li>Restaurant Staff: any email containing "restaurant" (e.g., restaurant@example.com)</li>
      </ul>
    </div>
  );
  
  // Quick login buttons for different roles
  const handleQuickLogin = async (role) => {
    setIsSubmitting(true);
    let email = '';
    
    switch(role) {
      case 'CUSTOMER':
        email = 'customer@example.com';
        break;
      case 'DELIVERY_PERSONNEL':
        email = 'delivery@example.com';
        break;
      case 'RESTAURANT_STAFF':
        email = 'restaurant@example.com';
        break;
      default:
        email = 'customer@example.com';
    }
    
    try {
      const result = await login(email, 'password123');
      
      if (result.success) {
        navigate(getDashboardUrl());
      } else {
        setErrors({
          form: result.error || 'Quick login failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error with quick login:', error);
      setErrors({
        form: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-title">Welcome Back</h2>
        
        {message && <div className="success-message">{message}</div>}
        {errors.form && <div className="error-message">{errors.form}</div>}
        
        {loginHelperText}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="quick-login">
          <p>Quick login as:</p>
          <div className="quick-login-buttons">
            <button 
              onClick={() => handleQuickLogin('CUSTOMER')}
              className="quick-login-button customer"
              disabled={isSubmitting}
            >
              Customer
            </button>
            <button 
              onClick={() => handleQuickLogin('DELIVERY_PERSONNEL')}
              className="quick-login-button delivery"
              disabled={isSubmitting}
            >
              Delivery
            </button>
            <button 
              onClick={() => handleQuickLogin('RESTAURANT_STAFF')}
              className="quick-login-button restaurant"
              disabled={isSubmitting}
            >
              Restaurant
            </button>
          </div>
        </div>
        
        <div className="auth-redirect">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
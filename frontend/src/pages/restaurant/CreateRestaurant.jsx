// frontend/src/pages/restaurant/CreateRestaurant.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/restaurant/CreateRestaurant.css';

const CreateRestaurant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    description: '',
    address: '',
    phoneNumber: '',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    deliveryFee: 2.99,
    deliveryTime: '30-45 min',
    priceRange: '$$'
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
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }
    
    if (!formData.cuisine.trim()) {
      newErrors.cuisine = 'Cuisine type is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Send request to create restaurant
        const response = await axios.post(
          `http://localhost:8080/api/restaurants/create`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Restaurant created:', response.data);
        
        // Navigate to restaurant dashboard after successful creation
        navigate('/restaurant/dashboard');
      } catch (error) {
        console.error('Error creating restaurant:', error);
        setErrors({
          form: error.response?.data?.message || 'Failed to create restaurant. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // List of cuisine types
  const cuisineTypes = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 
    'Thai', 'American', 'French', 'Mediterranean', 'Korean',
    'Vietnamese', 'Middle Eastern', 'Greek', 'Spanish', 'Other'
  ];
  
  // Price range options
  const priceRanges = [
    { value: '$', label: '$ (Inexpensive)' },
    { value: '$$', label: '$$ (Moderate)' },
    { value: '$$$', label: '$$$ (Expensive)' },
    { value: '$$$$', label: '$$$$ (Very Expensive)' }
  ];
  
  return (
    <div className="create-restaurant-container">
      <div className="create-restaurant-header">
        <h1>Create Your Restaurant</h1>
        <p>Set up your restaurant profile to start receiving orders</p>
      </div>
      
      <div className="create-restaurant-form-container">
        {errors.form && <div className="error-message">{errors.form}</div>}
        
        <form onSubmit={handleSubmit} className="create-restaurant-form">
          <div className="form-group">
            <label htmlFor="name">Restaurant Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="Enter your restaurant name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cuisine">Cuisine Type *</label>
            <select
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              className={errors.cuisine ? 'input-error' : ''}
            >
              <option value="">Select cuisine type</option>
              {cuisineTypes.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
            {errors.cuisine && <div className="error-message">{errors.cuisine}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your restaurant (specialties, history, etc.)"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'input-error' : ''}
              placeholder="Full restaurant address"
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? 'input-error' : ''}
              placeholder="Restaurant phone number"
            />
            {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="URL to your restaurant image"
            />
            <small>Provide a URL to an image of your restaurant (recommended size: 1200x800)</small>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="deliveryFee">Delivery Fee ($)</label>
              <input
                type="number"
                id="deliveryFee"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="deliveryTime">Delivery Time</label>
              <input
                type="text"
                id="deliveryTime"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                placeholder="e.g. 30-45 min"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="priceRange">Price Range</label>
              <select
                id="priceRange"
                name="priceRange"
                value={formData.priceRange}
                onChange={handleChange}
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="create-restaurant-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRestaurant;
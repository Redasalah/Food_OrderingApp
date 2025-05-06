// src/pages/restaurant/CreateRestaurant.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/restaurant/CreateRestaurant.css';

const CreateRestaurant = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    description: '',
    address: '',
    phoneNumber: '',
    email: '',
    openingHours: '',
    deliveryFee: 2.99,
    minimumOrderAmount: 10.00,
    imageUrl: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const cuisineTypes = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 
    'Thai', 'American', 'French', 'Mediterranean', 'Greek',
    'Turkish', 'Lebanese', 'Vietnamese', 'Korean', 'Spanish',
    'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // For number inputs, convert to float
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }
    
    if (!formData.cuisine) {
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
        // In a real app, make an API call to create the restaurant
        console.log('Creating restaurant with data:', formData);
        
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        alert('Restaurant created successfully!');
        
        // Redirect to dashboard
        navigate('/restaurant/dashboard');
      } catch (error) {
        console.error('Error creating restaurant:', error);
        setErrors({
          form: 'Failed to create restaurant. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="create-restaurant-container">
      <div className="create-restaurant-header">
        <h1>Create Your Restaurant</h1>
        <p>Set up your restaurant profile to start receiving orders</p>
      </div>
      
      <form className="create-restaurant-form" onSubmit={handleSubmit}>
        {errors.form && <div className="error-message">{errors.form}</div>}
        
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Restaurant Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
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
              placeholder="Describe your restaurant..."
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Contact Information</h2>
          
          <div className="form-group">
            <label htmlFor="address">Address *</label>
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
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? 'input-error' : ''}
            />
            {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Business Details</h2>
          
          <div className="form-group">
            <label htmlFor="openingHours">Opening Hours</label>
            <input
              type="text"
              id="openingHours"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleChange}
              placeholder="e.g. Mon-Fri 9am-10pm, Sat-Sun 10am-11pm"
            />
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
              <label htmlFor="minimumOrderAmount">Minimum Order ($)</label>
              <input
                type="number"
                id="minimumOrderAmount"
                name="minimumOrderAmount"
                value={formData.minimumOrderAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Restaurant Image</h2>
          
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/your-restaurant-image.jpg"
            />
            <small>Provide a URL to an image of your restaurant (recommended size: 1200x800px)</small>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Restaurant'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRestaurant;
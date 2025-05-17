// src/pages/restaurant/RestaurantSettings.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import restaurantApi from '../../api/restaurantApi';
// Comment out CSS import for now
 import '../../styles/restaurant/RestaurantSettings.css';

const RestaurantSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    description: '',
    address: '',
    phoneNumber: '',
    imageUrl: '',
    deliveryFee: 0,
    deliveryTime: '',
    priceRange: '',
    active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const cuisineTypes = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 
    'Thai', 'American', 'French', 'Mediterranean', 'Greek',
    'Turkish', 'Lebanese', 'Vietnamese', 'Korean', 'Spanish',
    'Other'
  ];
  
  useEffect(() => {
    // Get restaurant ID from URL query parameter if available
    const queryParams = new URLSearchParams(location.search);
    const restaurantIdParam = queryParams.get('id');
    
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantApi.getMyRestaurants();
        
        if (response.success) {
          const restaurantList = response.data;
          setRestaurants(restaurantList);
          
          if (restaurantList.length > 0) {
            // If restaurantId param exists, find that restaurant
            if (restaurantIdParam) {
              const matchingRestaurant = restaurantList.find(r => r.id.toString() === restaurantIdParam);
              if (matchingRestaurant) {
                setSelectedRestaurant(matchingRestaurant);
                populateFormData(matchingRestaurant);
                setLoading(false);
                return;
              }
            }
            
            // Otherwise select the first restaurant
            setSelectedRestaurant(restaurantList[0]);
            populateFormData(restaurantList[0]);
            setLoading(false);
          } else {
            setLoading(false);
          }
        } else {
          setError(response.error || 'Failed to load your restaurants.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('An unexpected error occurred. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [location.search]);
  
  const populateFormData = (restaurant) => {
    setFormData({
      name: restaurant.name || '',
      cuisine: restaurant.cuisine || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      phoneNumber: restaurant.phoneNumber || '',
      imageUrl: restaurant.imageUrl || '',
      deliveryFee: restaurant.deliveryFee || 0,
      deliveryTime: restaurant.deliveryTime || '',
      priceRange: restaurant.priceRange || '',
      active: restaurant.active !== undefined ? restaurant.active : true
    });
  };
  
  const handleRestaurantChange = (e) => {
    const restaurantId = parseInt(e.target.value);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    setSelectedRestaurant(restaurant);
    populateFormData(restaurant);
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (type === 'number') {
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
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear success message when user types
    if (successMessage) {
      setSuccessMessage('');
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Restaurant name is required';
    }
    
    if (!formData.cuisine) {
      errors.cuisine = 'Cuisine type is required';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRestaurant) {
      setFormErrors({ form: 'Please select a restaurant first' });
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const response = await restaurantApi.updateRestaurant(selectedRestaurant.id, formData);
        
        if (response.success) {
          setSuccessMessage('Restaurant updated successfully!');
          
          // Update the restaurant in the list
          const updatedRestaurants = restaurants.map(restaurant => 
            restaurant.id === selectedRestaurant.id ? response.data : restaurant
          );
          setRestaurants(updatedRestaurants);
          setSelectedRestaurant(response.data);
        } else {
          setFormErrors({ form: response.error || 'Failed to update restaurant.' });
        }
      } catch (error) {
        console.error('Error updating restaurant:', error);
        setFormErrors({ form: 'An unexpected error occurred. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleDeleteRestaurant = async () => {
    if (!selectedRestaurant) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRestaurant.name}? This action cannot be undone.`)) {
      try {
        const response = await restaurantApi.deleteRestaurant(selectedRestaurant.id);
        
        if (response.success) {
          // Remove the restaurant from the list
          const remainingRestaurants = restaurants.filter(r => r.id !== selectedRestaurant.id);
          setRestaurants(remainingRestaurants);
          
          if (remainingRestaurants.length > 0) {
            setSelectedRestaurant(remainingRestaurants[0]);
            populateFormData(remainingRestaurants[0]);
          } else {
            // Redirect to dashboard if no restaurants left
            navigate('/restaurant/dashboard');
          }
        } else {
          setError(response.error || 'Failed to delete restaurant.');
        }
      } catch (err) {
        console.error('Error deleting restaurant:', err);
        setError('Failed to delete restaurant. Please try again later.');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="restaurant-settings-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="restaurant-settings-container">
      <div className="settings-header">
        <h1>Restaurant Settings</h1>
        <p>Manage your restaurant details and preferences</p>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="no-restaurants-message">
          <p>You don't have any restaurants yet. Create a restaurant first to manage settings.</p>
          <a href="/restaurant/create" className="create-restaurant-btn">Create Restaurant</a>
        </div>
      ) : (
        <>
          <div className="restaurant-selector">
            <label htmlFor="restaurant-select">Select Restaurant:</label>
            <select 
              id="restaurant-select" 
              value={selectedRestaurant?.id || ''} 
              onChange={handleRestaurantChange}
            >
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          
          {formErrors.form && (
            <div className="error-message">{formErrors.form}</div>
          )}
          
          <div className="settings-form">
            <form onSubmit={handleSubmit}>
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
                    className={formErrors.name ? 'input-error' : ''}
                  />
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="cuisine">Cuisine Type *</label>
                  <select
                    id="cuisine"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    className={formErrors.cuisine ? 'input-error' : ''}
                  >
                    <option value="">Select cuisine type</option>
                    {cuisineTypes.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                  {formErrors.cuisine && <div className="error-message">{formErrors.cuisine}</div>}
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
                    className={formErrors.address ? 'input-error' : ''}
                  />
                  {formErrors.address && <div className="error-message">{formErrors.address}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number *</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={formErrors.phoneNumber ? 'input-error' : ''}
                  />
                  {formErrors.phoneNumber && <div className="error-message">{formErrors.phoneNumber}</div>}
                </div>
              </div>
              
              <div className="form-section">
                <h2>Business Details</h2>
                
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
                </div>
                
                <div className="form-group">
                  <label htmlFor="priceRange">Price Range</label>
                  <select
                    id="priceRange"
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleChange}
                  >
                    <option value="$">$ (Budget)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Expensive)</option>
                    <option value="$$$$">$$$$ (Very Expensive)</option>
                  </select>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <label htmlFor="active">
                    Restaurant Active (uncheck to temporarily hide your restaurant from customers)
                  </label>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
            
            <div className="danger-zone">
              <h2>Danger Zone</h2>
              <p>Once you delete a restaurant, there is no going back. Please be certain.</p>
              <button 
                className="delete-button"
                onClick={handleDeleteRestaurant}
                disabled={isSubmitting}
              >
                Delete Restaurant
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantSettings;
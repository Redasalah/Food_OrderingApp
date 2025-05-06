// frontend/src/pages/restaurant/ManageMenu.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import menuItemApi from '../../api/menuItemApi';
import restaurantApi from '../../api/restaurantApi';
import '../../styles/restaurant/ManageMenu.css';

const ManageMenu = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    popular: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Predefined categories
  const categories = [
    'Appetizers', 'Main Courses', 'Desserts', 'Drinks', 'Sides', 'Specials'
  ];
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Fetch restaurants owned by the user
        const response = await restaurantApi.getMyRestaurants();
        
        if (response.success) {
          setRestaurants(response.data);
          
          // Select the first restaurant by default
          if (response.data.length > 0) {
            setSelectedRestaurant(response.data[0]);
            fetchMenuItems(response.data[0].id);
          } else {
            setLoading(false);
          }
        } else {
          setError('Failed to fetch your restaurants. Please try again later.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('An unexpected error occurred. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);
  
  const fetchMenuItems = async (restaurantId) => {
    setLoading(true);
    try {
      const response = await menuItemApi.getMenuItems(restaurantId);
      
      if (response.success) {
        setMenuItems(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to fetch menu items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestaurantChange = (e) => {
    const restaurantId = parseInt(e.target.value);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    setSelectedRestaurant(restaurant);
    fetchMenuItems(restaurantId);
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMenuItem({
      ...newMenuItem,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear success message when user starts editing form
    if (successMessage) {
      setSuccessMessage('');
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!newMenuItem.name.trim()) {
      errors.name = 'Item name is required';
    }
    
    if (!newMenuItem.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!newMenuItem.price) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(newMenuItem.price)) || parseFloat(newMenuItem.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!newMenuItem.category) {
      errors.category = 'Category is required';
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
      
      const menuItemData = {
        ...newMenuItem,
        price: parseFloat(newMenuItem.price)
      };
      
      try {
        const response = await menuItemApi.createMenuItem(selectedRestaurant.id, menuItemData);
        
        if (response.success) {
          // Add the new item to the list
          setMenuItems([...menuItems, response.data]);
          
          // Reset form
          setNewMenuItem({
            name: '',
            description: '',
            price: '',
            imageUrl: '',
            category: '',
            popular: false
          });
          
          setSuccessMessage('Menu item added successfully!');
        } else {
          setFormErrors({ form: response.error });
        }
      } catch (error) {
        setFormErrors({ form: 'An unexpected error occurred. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleDeleteMenuItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        const response = await menuItemApi.deleteMenuItem(id);
        
        if (response.success) {
          // Update the menu items list
          setMenuItems(menuItems.filter(item => item.id !== id));
          setSuccessMessage('Menu item deleted successfully!');
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to delete menu item. Please try again later.');
      }
    }
  };
  
  // Group menu items by category
  const menuItemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  
  if (loading && restaurants.length === 0) {
    return (
      <div className="manage-menu-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="manage-menu-container">
      <div className="menu-header">
        <h1>Manage Menu</h1>
        <p>Add new items to your menu or manage existing ones</p>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="no-restaurants-message">
          <p>You don't have any restaurants yet. Create a restaurant first to manage its menu.</p>
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
          
          <div className="menu-content">
            <div className="add-menu-item-form">
              <h2>Add New Menu Item</h2>
              
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              
              {formErrors.form && (
                <div className="error-message">{formErrors.form}</div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Item Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newMenuItem.name}
                    onChange={handleChange}
                    className={formErrors.name ? 'input-error' : ''}
                  />
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newMenuItem.description}
                    onChange={handleChange}
                    className={formErrors.description ? 'input-error' : ''}
                    rows="3"
                  ></textarea>
                  {formErrors.description && <div className="error-message">{formErrors.description}</div>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price ($) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={newMenuItem.price}
                      onChange={handleChange}
                      className={formErrors.price ? 'input-error' : ''}
                      step="0.01"
                      min="0"
                    />
                    {formErrors.price && <div className="error-message">{formErrors.price}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={newMenuItem.category}
                      onChange={handleChange}
                      className={formErrors.category ? 'input-error' : ''}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {formErrors.category && <div className="error-message">{formErrors.category}</div>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="imageUrl">Image URL</label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={newMenuItem.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <small>Add an image URL for your menu item (optional but recommended)</small>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="popular"
                    name="popular"
                    checked={newMenuItem.popular}
                    onChange={handleChange}
                  />
                  <label htmlFor="popular">Mark as Popular</label>
                </div>
                
                <button 
                  type="submit" 
                  className="add-item-button" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Menu Item'}
                </button>
              </form>
            </div>
            
            <div className="current-menu-items">
              <h2>Current Menu Items</h2>
              
              {error && <div className="error-message">{error}</div>}
              
              {Object.keys(menuItemsByCategory).length > 0 ? (
                Object.entries(menuItemsByCategory).map(([category, items]) => (
                  <div key={category} className="menu-category">
                    <h3>{category}</h3>
                    <div className="menu-item-list">
                      {items.map(item => (
                        <div key={item.id} className="menu-item-card">
                          <div className="menu-item-header">
                            <h4>{item.name}</h4>
                            {item.popular && <span className="popular-badge">Popular</span>}
                          </div>
                          <p className="menu-item-description">{item.description}</p>
                          <div className="menu-item-footer">
                            <span className="menu-item-price">${parseFloat(item.price).toFixed(2)}</span>
                            <div className="menu-item-actions">
                              <button 
                                className="action-button delete"
                                onClick={() => handleDeleteMenuItem(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-items-message">
                  <p>No menu items found for this restaurant. Add your first item using the form!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageMenu;
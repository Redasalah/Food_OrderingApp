import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import restaurantApi from '../api/restaurantApi';
import '../styles/RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItemsByCategory, setMenuItemsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Use the cart context
  const { addItem, addToCart } = useCart();

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        const response = await restaurantApi.getRestaurantById(id);
        
        if (response.success) {
          console.log('Restaurant data:', response.data);
          setRestaurant(response.data);
          
          // Process menu items by category
          if (response.data.menuItems && response.data.menuItems.length > 0) {
            // Group menu items by category
            const itemsByCategory = {};
            response.data.menuItems.forEach(item => {
              if (!itemsByCategory[item.category]) {
                itemsByCategory[item.category] = [];
              }
              itemsByCategory[item.category].push(item);
            });
            
            // Set categories and items
            const categories = Object.keys(itemsByCategory);
            setMenuCategories(categories);
            setMenuItemsByCategory(itemsByCategory);
            
            // Set initial active category
            if (categories.length > 0) {
              setActiveCategory(categories[0]);
            }
          }
        } else {
          setError('Failed to load restaurant details. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  // Handle adding items to cart
  const handleAddToCart = (item) => {
    // Add restaurant info when adding an item
    const restaurantInfo = {
      id: restaurant.id,
      name: restaurant.name,
      imageUrl: restaurant.imageUrl
    };
    
    addItem({
      ...item,
      restaurantInfo
    });

    // Optional: Show a confirmation message
    alert(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading restaurant details...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="error-container">
        <h2>Restaurant Not Found</h2>
        <p>{error || 'Sorry, the restaurant has been removed.'}</p>
      </div>
    );
  }

  // Get items for the active category
  const activeCategoryItems = menuItemsByCategory[activeCategory] || [];

  return (
    <div className="restaurant-detail-container">
      <div 
        className="restaurant-banner" 
        style={{ backgroundImage: `url(${restaurant.imageUrl})` }}
      >
        <div className="restaurant-banner-content">
          <h1>{restaurant.name}</h1>
          <div className="restaurant-banner-meta">
            <span className="cuisine">{restaurant.cuisine}</span>
            <span className="rating">★ {restaurant.rating}</span>
            <span className="delivery-time">{restaurant.deliveryTime}</span>
            <span className="delivery-fee">${restaurant.deliveryFee.toFixed(2)} delivery</span>
          </div>
          <p className="restaurant-description">{restaurant.description}</p>
        </div>
      </div>

      <div className="restaurant-content">
        <div className="menu-sidebar">
          <h3>Menu</h3>
          <ul className="category-list">
            {menuCategories.map(category => (
              <li 
                key={category}
                className={activeCategory === category ? 'active' : ''}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>

        <div className="menu-content">
          <h2 className="category-title">
            {activeCategory || 'Menu'}
          </h2>
          
          <div className="menu-items">
            {activeCategoryItems.length > 0 ? (
              activeCategoryItems.map(item => (
                <div key={item.id} className="menu-item">
                  <div className="menu-item-info">
                    <h3>{item.name} {item.popular && <span className="popular-tag">Popular</span>}</h3>
                    <p className="menu-item-description">{item.description}</p>
                    <p className="menu-item-price">${item.price.toFixed(2)}</p>
                    <button 
                      className="add-to-cart-button"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                  {item.imageUrl && (
                    <div 
                      className="menu-item-image" 
                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="no-items-message">No items available in this category.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
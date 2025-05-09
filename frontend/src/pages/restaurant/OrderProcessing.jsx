// src/pages/restaurant/OrderProcessing.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import restaurantApi from '../../api/restaurantApi';
// Comment out CSS import for now
// import '../../styles/restaurant/OrderProcessing.css';

const OrderProcessing = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
                // fetchOrders(matchingRestaurant.id);
                setLoading(false);
                return;
              }
            }
            
            // Otherwise select the first restaurant
            setSelectedRestaurant(restaurantList[0]);
            // fetchOrders(restaurantList[0].id);
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
  
  const handleRestaurantChange = (e) => {
    const restaurantId = parseInt(e.target.value);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    setSelectedRestaurant(restaurant);
    // fetchOrders(restaurantId);
  };
  
  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="order-processing-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="order-processing-container">
      <div className="order-header">
        <h1>Order Processing</h1>
        <p>Manage and fulfill customer orders</p>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="no-restaurants-message">
          <p>You don't have any restaurants yet. Create a restaurant first to manage orders.</p>
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
          
          <div className="orders-content">
            <div className="order-tabs">
              <button className="tab-button active">New Orders</button>
              <button className="tab-button">Processing</button>
              <button className="tab-button">Ready for Pickup</button>
              <button className="tab-button">Completed</button>
            </div>
            
            <div className="order-list-container">
              <div className="no-orders-message">
                <p>No new orders at the moment.</p>
                <p>Orders will appear here when customers place them.</p>
              </div>
              
              {/* Placeholder for actual orders */}
              {/* 
              <div className="order-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">Order #{order.id}</div>
                      <div className="order-time">{order.createdAt}</div>
                    </div>
                    <div className="order-items">
                      {order.items.map(item => (
                        <div key={item.id} className="order-item">
                          <span className="item-quantity">{item.quantity}x</span>
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <div className="order-total">Total: ${order.totalAmount.toFixed(2)}</div>
                      <div className="order-actions">
                        <button className="action-button accept">Accept</button>
                        <button className="action-button reject">Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderProcessing;
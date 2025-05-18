// src/pages/restaurant/OrderProcessing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import restaurantApi from '../../api/restaurantApi';
import '../../styles/restaurant/OrderProcessing.css';

const OrderProcessing = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Fetch owned restaurants and then orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching restaurants owned by user...");
        
        // Step 1: Get restaurants owned by the current user
        const restaurantsResponse = await restaurantApi.getMyRestaurants();
        
        if (!restaurantsResponse.success) {
          setError(restaurantsResponse.error || 'Failed to load your restaurants');
          setLoading(false);
          return;
        }
        
        console.log("Restaurants response:", restaurantsResponse.data);
        
        if (restaurantsResponse.data.length === 0) {
          setError('You don\'t have any restaurants. Please create a restaurant first.');
          setLoading(false);
          return;
        }
        
        setRestaurants(restaurantsResponse.data);
        
        // Step 2: Set the first restaurant as selected by default
        const firstRestaurantId = restaurantsResponse.data[0].id;
        setSelectedRestaurantId(firstRestaurantId);
        
        // Step 3: Fetch orders for the selected restaurant
        await fetchRestaurantOrders(firstRestaurantId);
        
      } catch (err) {
        console.error("Error in initial data fetch:", err);
        setError('An unexpected error occurred. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Function to fetch orders for a specific restaurant
  const fetchRestaurantOrders = async (restaurantId, status = null) => {
    try {
      console.log(`Fetching orders for restaurant ID: ${restaurantId}, status: ${status || 'all'}`);
      
      const response = await restaurantApi.getRestaurantOrders(restaurantId, status);
      
      if (response.success) {
        console.log("Orders data:", response.data);
        setOrders(response.data);
      } else {
        console.error("Failed to fetch orders:", response.error);
        setError(response.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error("Error fetching restaurant orders:", err);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle restaurant change in dropdown
  const handleRestaurantChange = (e) => {
    const newRestaurantId = parseInt(e.target.value);
    setSelectedRestaurantId(newRestaurantId);
    fetchRestaurantOrders(newRestaurantId, filterStatus === 'ALL' ? null : filterStatus);
  };
  
  // Update order status function with debugging logs
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to status ${newStatus}`);
      
      // Add this to debug
      console.log("Before API call to update status");
      
      const response = await restaurantApi.updateOrderStatus(orderId, newStatus);
      
      // Add this to debug
      console.log("After API call to update status, response:", response);
      
      if (response.success) {
        console.log("Order status updated successfully:", response.data);
        
        // Refresh orders after status update
        await fetchRestaurantOrders(selectedRestaurantId, filterStatus === 'ALL' ? null : filterStatus);
        
        // Add this to debug
        console.log("After refreshing orders");
      } else {
        console.error("Failed to update order status:", response.error);
        setError(response.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      console.error("Error details:", err.response ? err.response.data : 'No response data');
      setError('An error occurred while updating the order status. Check console for details.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  if (loading) {
    return <div className="loading-container">Loading orders...</div>;
  }
  
  if (error) {
    return (
      <div className="restaurant-dashboard-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Filter orders based on selected status
  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);
    
  return (
    <div className="restaurant-dashboard-container">
      <div className="restaurant-sidebar">
        <div className="restaurant-profile">
          <h3>Restaurant Dashboard</h3>
          <p>Welcome, {user?.name || 'Restaurant Manager'}</p>
        </div>
        <nav className="restaurant-nav">
          <Link to="/restaurant/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/restaurant/menu" className="nav-item">Manage Menu</Link>
          <Link to="/restaurant/orders" className="nav-item active">Process Orders</Link>
          <Link to="/restaurant/settings" className="nav-item">Restaurant Profile</Link>
        </nav>
      </div>
      
      <div className="restaurant-main-content">
        <div className="dashboard-header">
          <h1>Process Orders</h1>
          <p>Manage and update customer orders</p>
        </div>
        
        {/* Restaurant Selector */}
        {restaurants.length > 1 && (
          <div className="restaurant-selector">
            <div className="restaurant-selector-content">
              <label htmlFor="restaurant-select">Select Restaurant:</label>
              <select 
                id="restaurant-select"
                value={selectedRestaurantId || ''}
                onChange={handleRestaurantChange}
              >
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="order-status-tabs">
          <button 
            className={filterStatus === 'ALL' ? 'active' : ''} 
            onClick={() => {
              setFilterStatus('ALL');
              fetchRestaurantOrders(selectedRestaurantId);
            }}
          >
            All Orders
          </button>
          <button 
            className={filterStatus === 'PENDING' ? 'active' : ''} 
            onClick={() => {
              setFilterStatus('PENDING');
              fetchRestaurantOrders(selectedRestaurantId, 'PENDING');
            }}
          >
            Pending
          </button>
          <button 
            className={filterStatus === 'CONFIRMED' ? 'active' : ''} 
            onClick={() => {
              setFilterStatus('CONFIRMED');
              fetchRestaurantOrders(selectedRestaurantId, 'CONFIRMED');
            }}
          >
            Confirmed
          </button>
          <button 
            className={filterStatus === 'READY_FOR_PICKUP' ? 'active' : ''} 
            onClick={() => {
              setFilterStatus('READY_FOR_PICKUP');
              fetchRestaurantOrders(selectedRestaurantId, 'READY_FOR_PICKUP');
            }}
          >
            Ready for Pickup
          </button>
          <button 
            className={filterStatus === 'OUT_FOR_DELIVERY' ? 'active' : ''} 
            onClick={() => {
              setFilterStatus('OUT_FOR_DELIVERY');
              fetchRestaurantOrders(selectedRestaurantId, 'OUT_FOR_DELIVERY');
            }}
          >
            Out for Delivery
          </button>
          <button 
            className={filterStatus === 'DELIVERED' ? 'active' : ''} 
            onClick={() => {
              setFilterStatus('DELIVERED');
              fetchRestaurantOrders(selectedRestaurantId, 'DELIVERED');
            }}
          >
            Delivered
          </button>
        </div>
        
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <p className="no-orders-message">No orders found with the selected status.</p>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id-section">
                    <h3>Order #{order.id}</h3>
                    <span className={`order-status ${order.status.toLowerCase()}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="order-time">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                
                <div className="order-content">
                  <div className="customer-details">
                    <h4>Customer Details</h4>
                    <p><strong>Name:</strong> {order.userName}</p>
                    <p><strong>Address:</strong> {order.deliveryAddress}</p>
                    {order.specialInstructions && (
                      <p><strong>Instructions:</strong> {order.specialInstructions}</p>
                    )}
                  </div>
                  
                  <div className="order-items-details">
                    <h4>Order Items</h4>
                    <ul className="order-items-list">
                      {order.orderItems.map((item) => (
                        <li key={item.id}>
                          <span className="item-name">{item.quantity}x {item.menuItemName}</span>
                          <span className="item-price">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="order-total">
                      <span>Total</span>
                      <span>${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="order-actions">
                  {order.status === 'PENDING' && (
                    <button 
                      className="action-button accept"
                      onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                    >
                      Accept Order
                    </button>
                  )}
                  
                  {order.status === 'CONFIRMED' && (
                    <button 
                      className="action-button ready"
                      onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                    >
                      Mark as Ready
                    </button>
                  )}
                  
                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <button 
                      className="action-button cancel"
                      onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                    >
                      Cancel Order
                    </button>
                  )}
                  
                  <button className="action-button print" onClick={() => window.print()}>Print Order</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderProcessing;
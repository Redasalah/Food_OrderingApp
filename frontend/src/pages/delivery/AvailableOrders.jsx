// frontend/src/pages/delivery/AvailableOrders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/delivery/AvailableOrders.css';

const AvailableOrders = () => {
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Define the correct API URL for the delivery endpoint
  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching available orders...');
      
      // Use the full URL to ensure correct API call
      const response = await axios.get('http://localhost:8080/api/delivery/available-orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Available orders response:', response.data);
      setAvailableOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching available orders:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to fetch available orders. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAvailableOrders();
    
    // Set up polling to refresh orders every 30 seconds
    const interval = setInterval(fetchAvailableOrders, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);
  const handleAcceptOrder = async (orderId) => {
    if (!orderId || orderId === "undefined") {
      console.error("❌ Invalid orderId:", orderId);
      setError("Invalid order ID. Please refresh the page.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      console.log(`Accepting order with ID: ${orderId}`);
  
      const response = await axios.post(
        `http://localhost:8080/api/delivery/orders/${orderId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      console.log('✅ Order accepted successfully:', response.data);
  
      // Use the ID from the response, or fallback to original ID if needed
      const acceptedOrderId = response.data?.id || orderId;
      
      // Ensure ID is valid before navigating
      if (acceptedOrderId && acceptedOrderId !== "undefined") {
        // Convert to string for URL path and navigate
        navigate(`/delivery/order/${acceptedOrderId.toString()}`);
      } else {
        setError("Failed to identify the accepted order. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error accepting order:", err);
      console.error("❌ Error details:", err.response?.data);
      setError(
        err.response?.data?.message ||
        'Failed to accept order. Please try again.'
      );
    }
  };
  
  

  if (loading) {
    return (
      <div className="available-orders-container">
        <div className="loading-message">Loading available orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="available-orders-container">
        <div className="error-message">{error}</div>
        <button 
          className="reset-filters-button" 
          onClick={fetchAvailableOrders}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="available-orders-container">
      <div className="available-orders-header">
        <h1>Available Orders</h1>
        <p>Select an order to deliver</p>
        <button 
          className="refresh-button" 
          onClick={fetchAvailableOrders}
        >
          Refresh Orders
        </button>
      </div>

      {availableOrders.length === 0 ? (
        <div className="no-orders-message">
          <p>No orders available for delivery at the moment.</p>
          <button 
            className="reset-filters-button" 
            onClick={fetchAvailableOrders}
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {availableOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <h3>Order #{order.id}</h3>
                <span className="order-status">Ready for Pickup</span>
              </div>

              <div className="order-card-details">
                <div className="detail-row">
                  <span className="detail-label">Restaurant:</span>
                  <span className="detail-value">{order.restaurantName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{order.deliveryAddress}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Items:</span>
                  <span className="detail-value">
                    {order.orderItems ? order.orderItems.length : 0}
                  </span>
                </div>
              </div>

              <div className="order-card-footer">
                <div className="order-amount">
                  <span className="amount-label">Total</span>
                  <span className="amount-value">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                <div className="delivery-fee">
                  <span className="fee-label">Delivery Fee</span>
                  <span className="fee-value">
                    ${order.deliveryFee.toFixed(2)}
                  </span>
                </div>

                <button 
                  className="accept-order-button"
                  onClick={() => handleAcceptOrder(order.id)}
                >
                  Accept Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOrders;
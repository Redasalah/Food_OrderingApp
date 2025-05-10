// src/pages/OrderConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/OrderConfirmation.css';

const OrderConfirmation = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch the user's most recent order
    const fetchRecentOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          'http://localhost:8080/api/orders?limit=1',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setOrders(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    
    fetchRecentOrders();
  }, []);
  
  if (loading) {
    return (
      <div className="order-confirmation-container">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="order-confirmation-container">
        <div className="error-message">{error}</div>
        <Link to="/dashboard" className="return-home-button">Return to Dashboard</Link>
      </div>
    );
  }
  
  return (
    <div className="order-confirmation-container">
      <div className="confirmation-header">
        <h1>Order Confirmed!</h1>
        <div className="confirmation-check">✓</div>
        <p>Thank you for your order, {user?.name || 'valued customer'}!</p>
      </div>
      
      {orders.length > 0 ? (
        <div className="order-details">
          <h2>Order Details</h2>
          
          <div className="order-info">
            <div className="order-info-row">
              <span>Order ID:</span>
              <span>{orders[0].id}</span>
            </div>
            <div className="order-info-row">
              <span>Restaurant:</span>
              <span>{orders[0].restaurantName}</span>
            </div>
            <div className="order-info-row">
              <span>Order Date:</span>
              <span>{new Date(orders[0].createdAt).toLocaleString()}</span>
            </div>
            <div className="order-info-row">
              <span>Status:</span>
              <span className="order-status">{orders[0].status}</span>
            </div>
            <div className="order-info-row">
              <span>Total:</span>
              <span className="order-total">${orders[0].total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="order-items-list">
            <h3>Items</h3>
            {orders[0].orderItems.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-quantity">{item.quantity}x</div>
                <div className="item-name">{item.name}</div>
                <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <div className="delivery-info">
            <h3>Delivery Information</h3>
            <p><strong>Address:</strong> {orders[0].deliveryAddress}</p>
            {orders[0].specialInstructions && (
              <p><strong>Special Instructions:</strong> {orders[0].specialInstructions}</p>
            )}
            <p><strong>Estimated Delivery Time:</strong> 30-45 minutes</p>
          </div>
        </div>
      ) : (
        <div className="no-orders-message">
          <p>No recent orders found.</p>
        </div>
      )}
      
      <div className="confirmation-actions">
        <Link to="/dashboard" className="home-button">Return to Dashboard</Link>
        <Link to="/orders" className="track-order-button">Track Your Orders</Link>
      </div>
      
      <div className="thank-you-message">
        <h3>Thank you for ordering with Quicky!</h3>
        <p>We hope you enjoy your meal.</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
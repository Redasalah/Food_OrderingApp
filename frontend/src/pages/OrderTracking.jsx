// src/pages/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import orderApi, { ORDER_STATUS_MAP } from '../api/orderApi';
import '../styles/OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await orderApi.getOrderById(orderId);
        
        if (response.success) {
          setOrder(response.data);
        } else {
          setError(response.error || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setCancelLoading(true);
      try {
        const result = await orderApi.cancelOrder(order.id);
        if (result.success) {
          // Update order status locally
          setOrder(prevOrder => ({
            ...prevOrder,
            status: 'CANCELLED'
          }));
        } else {
          // Handle error scenario
          alert(result.error || 'Failed to cancel order');
        }
      } catch (error) {
        console.error('Failed to cancel order:', error);
        alert('An unexpected error occurred while cancelling the order');
      } finally {
        setCancelLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-container">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-container">
        <div className="error-message">
          <p>{error}</p>
          <Link to="/orders" className="back-to-orders-btn">Back to Orders</Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-container">
        <div className="no-order-message">
          <p>Order not found</p>
          <Link to="/orders" className="back-to-orders-btn">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS_MAP[order.status] || {
    label: order.status,
    description: 'Order status',
    icon: '❓'
  };

  return (
    <div className="order-tracking-container">
      <div className="order-tracking-header">
        <h1>Order Tracking</h1>
        <p>Track the status of your order</p>
      </div>

      <div className="order-details-card">
        <div className="order-status-section">
          <div className="order-status-icon">{statusInfo.icon}</div>
          <div className="order-status-info">
            <h2>{statusInfo.label}</h2>
            <p>{statusInfo.description}</p>
          </div>
        </div>

        <div className="order-progress-tracker">
          {Object.keys(ORDER_STATUS_MAP).map((status, index) => (
            <div 
              key={status} 
              className={`progress-step ${
                Object.keys(ORDER_STATUS_MAP).indexOf(order.status) >= index 
                  ? 'completed' 
                  : ''
              }`}
            >
              <div className="step-icon">
                {ORDER_STATUS_MAP[status].icon}
              </div>
              <div className="step-label">
                {ORDER_STATUS_MAP[status].label}
              </div>
            </div>
          ))}
        </div>

        <div className="order-summary-section">
          <h3>Order Details</h3>
          <div className="order-info-grid">
            <div className="order-info-item">
              <span className="info-label">Order Number</span>
              <span className="info-value">#{order.id}</span>
            </div>
            <div className="order-info-item">
              <span className="info-label">Restaurant</span>
              <span className="info-value">{order.restaurantName}</span>
            </div>
            <div className="order-info-item">
              <span className="info-label">Order Date</span>
              <span className="info-value">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="order-info-item">
              <span className="info-label">Total Amount</span>
              <span className="info-value">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="order-items-section">
          <h3>Items</h3>
          {order.orderItems.map(item => (
            <div key={item.id} className="order-item">
              <div className="item-details">
                <span className="item-quantity">{item.quantity}x</span>
                <span className="item-name">{item.name}</span>
              </div>
              <span className="item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {order.specialInstructions && (
          <div className="special-instructions">
            <h3>Special Instructions</h3>
            <p>{order.specialInstructions}</p>
          </div>
        )}

        <div className="order-actions">
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <button 
              className="cancel-order-btn"
              onClick={handleCancelOrder}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          <Link to="/orders" className="back-to-orders-btn">
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
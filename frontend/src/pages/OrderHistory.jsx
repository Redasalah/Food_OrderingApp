// src/pages/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderApi from '../api/orderApi';
import '../styles/OrderHistory.css';

// Order status mapping for customer-friendly display
const ORDER_STATUS_MAP = {
  NEW: { 
    label: 'Order Placed', 
    color: '#007bff',
    icon: '📝'
  },
  PROCESSING: { 
    label: 'Preparing', 
    color: '#ffc107',
    icon: '👨‍🍳'
  },
  READY_FOR_PICKUP: { 
    label: 'Ready for Pickup', 
    color: '#28a745',
    icon: '🥡'
  },
  OUT_FOR_DELIVERY: { 
    label: 'Out for Delivery', 
    color: '#17a2b8',
    icon: '🚚'
  },
  COMPLETED: { 
    label: 'Delivered', 
    color: '#28a745',
    icon: '✅'
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: '#dc3545',
    icon: '❌'
  }
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderApi.getUserOrders();
        
        if (response.success) {
          setOrders(response.data);
        } else {
          setError(response.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on selected status
  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading-spinner">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>Your Orders</h1>
        <p>View and track your recent food orders</p>
      </div>

      <div className="order-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        {Object.keys(ORDER_STATUS_MAP).map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {ORDER_STATUS_MAP[status].label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders-message">
          <p>No orders found.</p>
          <Link to="/restaurants" className="browse-restaurants-btn">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => {
            const statusInfo = ORDER_STATUS_MAP[order.status] || {
              label: order.status,
              color: '#6c757d',
              icon: '❓'
            };

            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-restaurant">
                    <span className="restaurant-name">{order.restaurantName}</span>
                    <span 
                      className="order-status"
                      style={{ 
                        backgroundColor: statusInfo.color,
                        color: 'white'
                      }}
                    >
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                  <div className="order-meta">
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="order-items">
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

                <div className="order-summary">
                  <div className="order-total">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <Link 
                    to={`/orders/${order.id}`} 
                    className="track-order-btn"
                  >
                    Track Order
                  </Link>
                  {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                    <button 
                      className="cancel-order-btn"
                      onClick={async () => {
                        try {
                          const result = await orderApi.cancelOrder(order.id);
                          if (result.success) {
                            // Update local state
                            setOrders(prevOrders => 
                              prevOrders.map(prevOrder => 
                                prevOrder.id === order.id 
                                  ? { ...prevOrder, status: 'CANCELLED' } 
                                  : prevOrder
                              )
                            );
                          }
                        } catch (error) {
                          console.error('Failed to cancel order:', error);
                        }
                      }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
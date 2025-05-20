// src/pages/restaurant/OrderProcessing.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import restaurantApi from '../../api/restaurantApi';
import '../../styles/restaurant/OrderProcessing.css';

// Simplified DeliveryTracker component without WebSocket dependency
const DeliveryTracker = ({ order }) => {
  const [deliveryStatus, setDeliveryStatus] = useState(order.status);

  useEffect(() => {
    setDeliveryStatus(order.status);
  }, [order.status]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return { text: 'Ready for pickup', color: 'blue' };
      case 'OUT_FOR_DELIVERY':
        return { text: 'Out for delivery', color: 'orange' };
      case 'DELIVERED':
        return { text: 'Delivered', color: 'green' };
      default:
        return { text: status.replace(/_/g, ' '), color: 'gray' };
    }
  };

  const statusInfo = getStatusInfo(deliveryStatus);

  return (
    <div className="delivery-tracker">
      <h4 className={`delivery-status delivery-status-${statusInfo.color}`}>
        Delivery Status: {statusInfo.text}
      </h4>
      <div className="delivery-progress">
        <div className="progress-bar">
          <div className="progress-step completed">
            <div className="step-marker"></div>
            <div className="step-label">Confirmed</div>
          </div>
          <div className={`progress-step ${['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(deliveryStatus) ? 'completed' : ''}`}>
            <div className="step-marker"></div>
            <div className="step-label">Ready</div>
          </div>
          <div className={`progress-step ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(deliveryStatus) ? 'completed' : ''}`}>
            <div className="step-marker"></div>
            <div className="step-label">Picked Up</div>
          </div>
          <div className={`progress-step ${deliveryStatus === 'DELIVERED' ? 'completed' : ''}`}>
            <div className="step-marker"></div>
            <div className="step-label">Delivered</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderProcessing = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const restaurantsResponse = await restaurantApi.getMyRestaurants();

        if (!restaurantsResponse.success || restaurantsResponse.data.length === 0) {
          setError('You don\'t have any restaurants. Please create a restaurant first.');
          setLoading(false);
          return;
        }

        setRestaurants(restaurantsResponse.data);
        const firstRestaurantId = restaurantsResponse.data[0].id;
        setSelectedRestaurantId(firstRestaurantId);
        await fetchRestaurantOrders(firstRestaurantId);
      } catch (err) {
        console.error("Error loading data:", err);
        setError('An unexpected error occurred. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchRestaurantOrders = async (restaurantId, status = null) => {
    try {
      const response = await restaurantApi.getRestaurantOrders(restaurantId, status);
      if (response.success) {
        setOrders(response.data);
      } else {
        setError(response.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantChange = (e) => {
    const newRestaurantId = parseInt(e.target.value);
    setSelectedRestaurantId(newRestaurantId);
    fetchRestaurantOrders(newRestaurantId, activeTab === 'all' ? null : activeTab);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedRestaurantId) {
      fetchRestaurantOrders(selectedRestaurantId, tab === 'all' ? null : tab);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await restaurantApi.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        showNotification(`Order #${orderId} status updated to ${newStatus}`);
        fetchRestaurantOrders(selectedRestaurantId, activeTab === 'all' ? null : activeTab);
      } else {
        setError(response.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError('An error occurred while updating the order status.');
    }
  };

  const handleAcceptOrder = (orderId) => updateOrderStatus(orderId, 'CONFIRMED');
  const handleRejectOrder = (orderId) => updateOrderStatus(orderId, 'CANCELLED');
  const handleMarkAsReady = (orderId) => updateOrderStatus(orderId, 'READY_FOR_PICKUP');

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  if (loading) return <div className="loading-container">Loading orders...</div>;

  if (error) {
    return (
      <div className="restaurant-dashboard-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-dashboard-container">
      {notification && (
        <div className="notification-banner">
          <p>{notification}</p>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <div className="dashboard-header">
        <h1>Process Orders</h1>
        <p>Manage and update customer orders</p>
      </div>

      {restaurants.length > 1 && (
        <div className="restaurant-selector">
          <label htmlFor="restaurant-select">Select Restaurant:</label>
          <select id="restaurant-select" value={selectedRestaurantId || ''} onChange={handleRestaurantChange}>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="order-status-tabs">
        {['all', 'PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => handleTabChange(tab)}
          >
            {tab === 'all' ? 'All Orders' : tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="no-orders-message">No orders found with the selected status.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id-section">
                  <h3>Order #{order.id}</h3>
                  <span className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="order-time">{formatDate(order.createdAt)}</div>
              </div>

              <div className="order-content">
                <div className="customer-details">
                  <h4>Customer Details</h4>
                  <p><strong>Name:</strong> {order.userName}</p>
                  <p><strong>Address:</strong> {order.deliveryAddress}</p>
                  {order.specialInstructions && <p><strong>Instructions:</strong> {order.specialInstructions}</p>}
                </div>

                <div className="order-items-details">
                  <h4>Order Items</h4>
                  <ul className="order-items-list">
                    {order.orderItems.map(item => (
                      <li key={item.id}>
                        <span>{item.quantity}x {item.menuItemName}</span>
                        <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="order-total">
                    <span>Total</span>
                    <span>${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) && (
                <DeliveryTracker order={order} />
              )}

              <div className="order-actions">
                {order.status === 'PENDING' && (
                  <>
                    <button className="action-button accept" onClick={() => handleAcceptOrder(order.id)}>
                      Accept Order
                    </button>
                    <button className="action-button cancel" onClick={() => handleRejectOrder(order.id)}>
                      Cancel Order
                    </button>
                  </>
                )}
                {order.status === 'CONFIRMED' && (
                  <button className="action-button ready" onClick={() => handleMarkAsReady(order.id)}>
                    Mark as Ready
                  </button>
                )}
                <button className="action-button print" onClick={() => window.print()}>
                  Print Order
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderProcessing;

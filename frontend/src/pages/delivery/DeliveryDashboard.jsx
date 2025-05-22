// src/pages/delivery/DeliveryDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import '../../styles/delivery/DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedToday: 0,
    earnings: 0,
    rating: null,
  });

  const [recentDeliveries, setRecentDeliveries] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/delivery/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      // Fallback for missing fields
      const totalDeliveries = (data.deliveredToday || 0) + (data.activeDelivery ? 1 : 0);
      const earnings = data.totalEarningsToday || 0;
      const rating = data.rating ?? null; // Optional backend field

      setStats({
        totalDeliveries,
        completedToday: data.deliveredToday || 0,
        earnings,
        rating,
      });

      const formattedDeliveries = (data.recentDeliveries || []).map(delivery => ({
        id: delivery.orderId || delivery.id,
        date: delivery.completedAt || new Date().toISOString(),
        restaurant: delivery.restaurantName || 'N/A',
        customer: delivery.customerName || 'Customer',
        address: delivery.deliveryAddress || 'Unknown',
        amount: delivery.earnings || 0,
        status: delivery.status || 'Delivered',
      }));

      setRecentDeliveries(formattedDeliveries);
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="delivery-loading-container">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delivery-loading-container">
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="delivery-dashboard-container">
      <div className="delivery-dashboard-header">
        <h1>Delivery Dashboard</h1>
        <p>Welcome back, {user?.name || 'Delivery Partner'}</p>
      </div>

      <div className="delivery-stats-container">
        <div className="delivery-stat-card">
          <h3>Total Deliveries</h3>
          <p className="stat-value">{stats.totalDeliveries}</p>
        </div>
        <div className="delivery-stat-card">
          <h3>Completed Today</h3>
          <p className="stat-value">{stats.completedToday}</p>
        </div>
        <div className="delivery-stat-card">
          <h3>Total Earnings</h3>
          <p className="stat-value">${stats.earnings.toFixed(2)}</p>
        </div>
        <div className="delivery-stat-card">
          <h3>Your Rating</h3>
          <p className="stat-value">
            {stats.rating ? `★ ${stats.rating.toFixed(1)}` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="delivery-actions-container">
        <Link to="/delivery/available-orders" className="delivery-action-button primary">
          View Available Orders
        </Link>
        <Link to="/delivery/order-history" className="delivery-action-button secondary">
          Delivery History
        </Link>
      </div>

      <div className="recent-deliveries-container">
        <h2>Recent Deliveries</h2>

        {recentDeliveries.length > 0 ? (
          <div className="recent-deliveries-list">
            {recentDeliveries.map(delivery => (
              <div key={delivery.id} className="delivery-item">
                <div className="delivery-item-header">
                  <h3>{delivery.restaurant}</h3>
                  <span className="delivery-status">{delivery.status}</span>
                </div>
                <div className="delivery-item-details">
                  <p><strong>Order ID:</strong> {delivery.id}</p>
                  <p><strong>Date:</strong> {new Date(delivery.date).toLocaleDateString()}</p>
                  <p><strong>Customer:</strong> {delivery.customer}</p>
                  <p><strong>Address:</strong> {delivery.address}</p>
                  <p><strong>Amount:</strong> ${delivery.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-deliveries-message">You haven't made any deliveries yet.</p>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;

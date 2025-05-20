import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DeliveryDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    activeDelivery: null,
    deliveredToday: 0,
    totalEarningsToday: 0,
    isActive: false,
    availableOrders: 0,
    recentDeliveries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const wsRef = useRef(null);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (!currentUser || !currentUser.token) return;
    
    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Create new WebSocket connection
    const wsUrl = `${process.env.REACT_APP_WS_URL || 'wss://api.yourbackend.com'}/orders`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
      // Identify as a delivery person
      wsRef.current.send(JSON.stringify({
        type: 'IDENTIFY',
        role: 'DELIVERY',
        deliveryPersonId: currentUser.id
      }));
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'NEW_AVAILABLE_ORDER') {
        // Handle new order available for delivery
        showNotification('New order available for delivery!');
        fetchDashboardData();
      } else if (data.type === 'ORDER_ASSIGNED' && data.deliveryPersonId === currentUser.id) {
        // Handle order assigned to this delivery person
        showNotification(`Order #${data.orderId} has been assigned to you.`);
        fetchDashboardData();
      } else if (data.type === 'ORDER_UPDATE') {
        // General order updates
        if (data.status === 'READY_FOR_PICKUP') {
          showNotification('New order ready for pickup!');
          fetchDashboardData();
        } else if (data.deliveryPersonId === currentUser.id) {
          // Update for your assigned order
          showNotification(`Order #${data.orderId} status updated to ${data.status}`);
          fetchDashboardData();
        }
      } else if (data.type === 'EARNING_UPDATE' && data.deliveryPersonId === currentUser.id) {
        // Handle earnings update
        showNotification(`New earnings: $${data.amount.toFixed(2)}`);
        fetchDashboardData();
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentUser]);

  // Function to show notification
  const showNotification = (message) => {
    setNotification(message);
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/delivery/dashboard', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again later.');
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.token) {
      fetchDashboardData();
      
      // Refresh data every minute as a fallback to WebSockets
      const interval = setInterval(fetchDashboardData, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);
  
  // Handle toggle active status
  const toggleActiveStatus = async () => {
    try {
      const newStatus = !dashboardData.isActive;
      await axios.post('/api/delivery/toggle-status', 
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        }
      );
      
      // Update WebSocket status
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'DELIVERY_STATUS_UPDATE',
          deliveryPersonId: currentUser.id,
          isActive: newStatus
        }));
      }
      
      // Update local state
      setDashboardData({
        ...dashboardData,
        isActive: newStatus
      });
      
      showNotification(`You are now ${newStatus ? 'online' : 'offline'}.`);
    } catch (err) {
      setError('Failed to update your status. Please try again.');
      console.error('Error toggling status:', err);
    }
  };

  if (loading) return (
    <div className="text-center p-10">
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading dashboard...</span>
      </div>
      <p className="mt-2">Loading dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
      <p>{error}</p>
      <button 
        onClick={() => fetchDashboardData()}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification Banner */}
      {notification && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 flex justify-between items-center">
          <p>{notification}</p>
          <button onClick={() => setNotification(null)} className="text-blue-700">✕</button>
        </div>
      )}
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Delivery Dashboard</h1>
        
        <div className="flex items-center">
          <span className={`mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            dashboardData.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <span className={`h-2 w-2 mr-1 rounded-full ${
              dashboardData.isActive ? 'bg-green-500' : 'bg-gray-500'
            }`}></span>
            Status: {dashboardData.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={toggleActiveStatus}
            className={`px-4 py-2 rounded-lg ${
              dashboardData.isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {dashboardData.isActive ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>
      
      {/* Active Delivery Section */}
      {dashboardData.activeDelivery ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Active Delivery</h2>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="font-medium">Order #{dashboardData.activeDelivery.id}</p>
              <p className="text-sm text-gray-600">Restaurant: {dashboardData.activeDelivery.restaurant.name}</p>
              <p className="text-sm text-gray-600 mb-2">Status: {dashboardData.activeDelivery.status.replace(/_/g, ' ')}</p>
              
              {/* Show pickup code if available */}
              {dashboardData.activeDelivery.pickupCode && 
               (dashboardData.activeDelivery.status === 'ASSIGNED_TO_DELIVERY' || 
                dashboardData.activeDelivery.status === 'READY_FOR_PICKUP') && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded mb-2">
                  <p className="text-sm font-medium">Pickup Code: {dashboardData.activeDelivery.pickupCode}</p>
                </div>
              )}
              
              {/* Estimated earnings */}
              <div className="mt-2">
                <span className="text-sm font-medium text-green-600">
                  Estimated earnings: ${dashboardData.activeDelivery.deliveryFee.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to={`/delivery/order/${dashboardData.activeDelivery.id}`}
                className="px-4 py-2 bg-blue-500 text-white text-center rounded hover:bg-blue-600"
              >
                View Order Details
              </Link>
              
              {/* Navigation buttons based on status */}
              {(dashboardData.activeDelivery.status === 'ASSIGNED_TO_DELIVERY' || 
                dashboardData.activeDelivery.status === 'READY_FOR_PICKUP') && (
                <button
                  onClick={() => {
                    const address = dashboardData.activeDelivery.restaurant.address;
                    const formattedAddress = encodeURIComponent(
                      `${address.street}, ${address.city}, ${address.zipCode}`
                    );
                    window.open(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`, '_blank');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-800 text-center rounded hover:bg-gray-200"
                >
                  Navigate to Restaurant
                </button>
              )}
              
              {dashboardData.activeDelivery.status === 'PICKED_UP' && (
                <button
                  onClick={() => {
                    const address = dashboardData.activeDelivery.deliveryAddress;
                    const formattedAddress = encodeURIComponent(
                      `${address.street}, ${address.city}, ${address.zipCode}`
                    );
                    window.open(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`, '_blank');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-800 text-center rounded hover:bg-gray-200"
                >
                  Navigate to Customer
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        dashboardData.isActive && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">No Active Delivery</h2>
            <p className="text-sm text-gray-600 mb-4">You're online and ready to accept deliveries.</p>
            {dashboardData.availableOrders > 0 ? (
              <Link
                to="/delivery/available-orders"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View Available Orders ({dashboardData.availableOrders})
              </Link>
            ) : (
              <p className="text-sm text-gray-500">No orders available for delivery at the moment.</p>
            )}
          </div>
        )
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Deliveries */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Today's Deliveries</h3>
            <div className="p-2 bg-blue-100 rounded-full">
              📦
            </div>
          </div>
          <p className="text-3xl font-bold">{dashboardData.deliveredToday}</p>
        </div>
        
        {/* Today's Earnings */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Today's Earnings</h3>
            <div className="p-2 bg-green-100 rounded-full">
              💰
            </div>
          </div>
          <p className="text-3xl font-bold">${dashboardData.totalEarningsToday.toFixed(2)}</p>
        </div>
        
        {/* Available Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Available Orders</h3>
            <div className="p-2 bg-yellow-100 rounded-full">
              📋
            </div>
          </div>
          <p className="text-3xl font-bold">{dashboardData.availableOrders}</p>
          {dashboardData.availableOrders > 0 && dashboardData.isActive && (
            <Link
              to="/delivery/available-orders"
              className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
            >
              View available orders →
            </Link>
          )}
        </div>
      </div>
      
      {/* Recent Deliveries */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Deliveries</h2>
          <Link
            to="/delivery/history"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            View All
          </Link>
        </div>
        
        {dashboardData.recentDeliveries && dashboardData.recentDeliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.recentDeliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td className="px-4 py-3 whitespace-nowrap">#{delivery.orderId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{delivery.restaurantName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(delivery.completedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">${delivery.earnings.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                        delivery.status === 'DELIVERED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {delivery.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">No recent deliveries to display.</p>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
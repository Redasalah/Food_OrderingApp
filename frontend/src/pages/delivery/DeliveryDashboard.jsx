import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DeliveryDashboard = () => {
  const { currentUser } = useAuth();
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

  useEffect(() => {
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

    fetchDashboardData();
    
    // Refresh data every minute
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);


  
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
      
      // Update local state
      setDashboardData({
        ...dashboardData,
        isActive: newStatus
      });
    } catch (err) {
      setError('Failed to update your status. Please try again.');
      console.error('Error toggling status:', err);
    }
  };

  if (loading) return <div className="text-center p-10">Loading dashboard...</div>;
  
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
      <p>{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Delivery Dashboard</h1>
        
        <div className="flex items-center">
          <span className="mr-2">
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
              <p className="text-sm text-gray-600">Status: {dashboardData.activeDelivery.status}</p>
            </div>
            <Link
              to={`/delivery/order/${dashboardData.activeDelivery.id}`}
              className="px-4 py-2 bg-blue-500 text-white text-center rounded hover:bg-blue-600"
            >
              View Order Details
            </Link>
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
          {dashboardData.availableOrders > 0 && (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.recentDeliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td className="px-4 py-3 whitespace-nowrap">#{delivery.orderId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{delivery.restaurantName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(delivery.completedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">${delivery.earnings.toFixed(2)}</td>
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AvailableOrders = () => {
  const { currentUser } = useAuth();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In AvailableOrders.jsx
const fetchAvailableOrders = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const response = await axios.get('/api/delivery/available-orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    setAvailableOrders(response.data);
    setLoading(false);
  } catch (err) {
    setError('Failed to fetch available orders. Please try again later.');
    setLoading(false);
    console.error('Error fetching available orders:', err);
  }
};

    fetchAvailableOrders();
    
    // Set up polling to refresh the list every 30 seconds
    const interval = setInterval(fetchAvailableOrders, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await axios.post(`/api/delivery/orders/${orderId}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      
      // Redirect to the delivery order page
      window.location.href = `/delivery/order/${orderId}`;
    } catch (err) {
      setError('Failed to accept order. Please try again.');
      console.error('Error accepting order:', err);
    }
  };

  // Format distance for display
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  if (loading) return <div className="text-center p-10">Loading available orders...</div>;
  
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
      <p>{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Available Orders</h1>
      
      {availableOrders.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No orders available for delivery at this time.</p>
          <p className="text-gray-500 mt-2">Check back soon or refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Ready for pickup
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Restaurant:</h3>
                <p className="text-sm">{order.restaurant.name}</p>
                <p className="text-sm text-gray-500">{order.restaurant.address}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Distance: {formatDistance(order.restaurantDistance)}
                </p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Delivery to:</h3>
                <p className="text-sm">{order.deliveryAddress.street}</p>
                <p className="text-sm text-gray-500">
                  {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Distance from restaurant: {formatDistance(order.deliveryDistance)}
                </p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Order summary:</h3>
                <p className="text-sm">{order.itemCount} items</p>
                <p className="text-sm font-medium mt-1">Estimated delivery time: {order.estimatedDeliveryTime} min</p>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Delivery fee:</span>
                <span className="font-bold">${order.deliveryFee.toFixed(2)}</span>
              </div>
              
              <button
                onClick={() => handleAcceptOrder(order.id)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Accept Delivery
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOrders;
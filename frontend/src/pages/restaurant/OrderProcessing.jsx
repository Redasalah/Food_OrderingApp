import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const OrderProcessing = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch restaurant orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Assuming the restaurant ID is stored in the user object or can be fetched
        const restaurantId = currentUser?.restaurantId; 
        
        if (!restaurantId) {
          setError('Restaurant ID not found. Please set up your restaurant profile.');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`/api/restaurants/${restaurantId}/orders`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
        
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        setLoading(false);
        console.error('Error fetching restaurant orders:', err);
      }
    };
    
    fetchOrders();
  }, [currentUser]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        }
      );
      
      // Refresh orders after updating
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      
      setOrders(updatedOrders);
    } catch (err) {
      setError('Failed to update order status. Please try again.');
      console.error('Error updating order status:', err);
    }
  };

  // Handle order acceptance
  const handleAcceptOrder = (orderId) => {
    updateOrderStatus(orderId, 'PREPARING');
  };

  // Handle order rejection
  const handleRejectOrder = (orderId) => {
    updateOrderStatus(orderId, 'REJECTED');
  };

  // Handle order ready for pickup
  const handleOrderReady = (orderId) => {
    updateOrderStatus(orderId, 'READY_FOR_PICKUP');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="text-center p-10">Loading orders...</div>;
  
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
      <p>{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Processing</h1>
      
      {orders.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No orders to process at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'READY_FOR_PICKUP' ? 'bg-green-100 text-green-800' :
                  order.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Placed: {formatDate(order.createdAt)}
              </p>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Items:</h3>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-sm">
                      {item.quantity}x {item.menuItem.name} - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${order.totalPrice.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-2">Customer:</h3>
                <p className="text-sm">{order.customer.name}</p>
                <p className="text-sm">{order.customer.phone}</p>
              </div>
              
              {order.status === 'NEW' && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex-1"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectOrder(order.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex-1"
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {order.status === 'PREPARING' && (
                <button
                  onClick={() => handleOrderReady(order.id)}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Mark as Ready
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderProcessing;
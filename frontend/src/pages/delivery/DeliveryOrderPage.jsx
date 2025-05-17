import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DeliveryOrderPage = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/delivery/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
        setOrder(response.data);
        setCurrentStatus(response.data.status);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch order details. Please try again later.');
        setLoading(false);
        console.error('Error fetching order details:', err);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, currentUser]);

  const updateOrderStatus = async (newStatus) => {
    try {
      await axios.put(`/api/delivery/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        }
      );
      
      setCurrentStatus(newStatus);
      
      // If order is completed, redirect to available orders after a delay
      if (newStatus === 'DELIVERED') {
        setTimeout(() => {
          navigate('/delivery/available-orders');
        }, 3000);
      }
    } catch (err) {
      setError('Failed to update order status. Please try again.');
      console.error('Error updating order status:', err);
    }
  };

  const handlePickupConfirm = () => {
    updateOrderStatus('PICKED_UP');
  };

  const handleDeliveryConfirm = () => {
    setIsConfirmModalOpen(true);
  };

  const completeDelivery = () => {
    updateOrderStatus('DELIVERED');
    setIsConfirmModalOpen(false);
  };

  const cancelConfirmation = () => {
    setIsConfirmModalOpen(false);
  };

  const openGoogleMaps = (address) => {
    // Format the address for Google Maps URL
    const formattedAddress = encodeURIComponent(
      `${address.street}, ${address.city}, ${address.zipCode}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`, '_blank');
  };

  const callCustomer = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (loading) return <div className="text-center p-10">Loading order details...</div>;
  
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
      <p>{error}</p>
    </div>
  );

  if (!order) return <div className="text-center p-10">Order not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order #{orderId}</h1>
      
      {/* Status Banner */}
      <div className={`mb-6 p-4 rounded-lg ${
        currentStatus === 'READY_FOR_PICKUP' ? 'bg-blue-100' :
        currentStatus === 'PICKED_UP' ? 'bg-yellow-100' :
        currentStatus === 'DELIVERED' ? 'bg-green-100' :
        'bg-gray-100'
      }`}>
        <h2 className="font-semibold text-lg mb-2">Status: {currentStatus.replace('_', ' ')}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${
            currentStatus === 'READY_FOR_PICKUP' ? 'w-1/3 bg-blue-600' :
            currentStatus === 'PICKED_UP' ? 'w-2/3 bg-yellow-600' :
            currentStatus === 'DELIVERED' ? 'w-full bg-green-600' :
            'w-0'
          }`}></div>
        </div>
      </div>
      
      {/* Restaurant Info */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Restaurant</h2>
        <div className="mb-4">
          <p className="font-medium">{order.restaurant.name}</p>
          <p className="text-gray-500">{order.restaurant.address.street}</p>
          <p className="text-gray-500">{order.restaurant.address.city}, {order.restaurant.address.zipCode}</p>
          <p className="text-gray-500">{order.restaurant.phone}</p>
        </div>
        
        <button
          onClick={() => openGoogleMaps(order.restaurant.address)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
        >
          Navigate to Restaurant
        </button>
      </div>
      
      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Customer</h2>
        <div className="mb-4">
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-gray-500">{order.deliveryAddress.street}</p>
          <p className="text-gray-500">{order.deliveryAddress.city}, {order.deliveryAddress.zipCode}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => callCustomer(order.customer.phone)}
            className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
          >
            Call Customer
          </button>
          
          <button
            onClick={() => openGoogleMaps(order.deliveryAddress)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            Navigate to Customer
          </button>
        </div>
      </div>
      
      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between">
              <div>
                <p>{item.quantity}x {item.menuItem.name}</p>
                {item.specialInstructions && (
                  <p className="text-sm text-gray-500">Note: {item.specialInstructions}</p>
                )}
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Delivery Fee</span>
            <span>${order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        {currentStatus === 'READY_FOR_PICKUP' && (
          <button
            onClick={handlePickupConfirm}
            className="w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600"
          >
            Confirm Pickup from Restaurant
          </button>
        )}
        
        {currentStatus === 'PICKED_UP' && (
          <button
            onClick={handleDeliveryConfirm}
            className="w-full px-4 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600"
          >
            Confirm Delivery to Customer
          </button>
        )}
        
        {currentStatus === 'DELIVERED' && (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-2">
              ✓ Delivery completed successfully!
            </p>
            <p className="text-gray-500">You will be redirected to available orders shortly...</p>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delivery</h3>
            <p className="mb-6">Are you sure you want to mark this order as delivered?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelConfirmation}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={completeDelivery}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrderPage;
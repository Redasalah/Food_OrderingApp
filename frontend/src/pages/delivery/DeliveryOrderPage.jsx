// src/pages/delivery/DeliveryOrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/delivery/DeliveryOrderPage.css';

const DeliveryOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [customerContactAttempted, setCustomerContactAttempted] = useState(false);

  // Define status steps for the progress indicator
  const DELIVERY_STEPS = [
    { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { id: 'DELIVERED', label: 'Delivered' }
  ];
  console.log("Current orderId type:", typeof orderId, "value:", orderId);
  // Fetch order details on component mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
  
        if (!token) {
          console.error("No token found");
          setError("Unauthorized. Please log in again.");
          setLoading(false);
          return;
        }
        
        // Validate orderId exists and is valid
        if (!orderId || orderId === "undefined" || isNaN(parseInt(orderId))) {
          console.error("Invalid orderId:", orderId);
          setError("Invalid order ID. Please go back and select a valid order.");
          setLoading(false);
          return;
        }
  
        console.log("Fetching order with ID:", orderId);
  
        const response = await axios.get(`http://localhost:8080/api/delivery/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        console.log('Order details fetched:', response.data);
        
        // Check if response data is valid
        if (!response.data || !response.data.id) {
          setError("Received invalid order data from server.");
          setLoading(false);
          return;
        }
        
        setOrder(response.data);
        setCurrentStatus(response.data.status);
      } catch (err) {
        console.error('❌ Error fetching order details:', err);
        
        // Check if error is 404 Not Found
        if (err.response && err.response.status === 404) {
          setError("This order does not exist or has been deleted.");
        } else {
          setError(err.response?.data?.message || 'Failed to fetch order details. Please try again.');
        }
      } finally {
        console.log("✅ Finished attempt to load order details.");
        setLoading(false);
      }
    };
  
    fetchOrderDetails();
  }, [orderId]);
  
  // Update order status
  const updateOrderStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`Updating order ${orderId} status to ${newStatus}`);
      
      // Validate orderId is a valid number
      if (!orderId || orderId === "undefined" || isNaN(parseInt(orderId))) {
        setError("Invalid order ID. Cannot update status.");
        return false;
      }
      
      const response = await axios.put(
        `http://localhost:8080/api/delivery/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Order status updated:', response.data);
      setOrder(response.data);
      setCurrentStatus(response.data.status);
      
      // Close confirmation modal if it's open
      setIsConfirmModalOpen(false);
      
      // If order is completed, redirect after a delay
      if (newStatus === 'DELIVERED') {
        setTimeout(() => {
          navigate('/delivery/available-orders');
        }, 3000);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to update order status. Please try again.');
      return false;
    }
  };

  // Handle pickup confirmation
  const handlePickupConfirm = async () => {
    await updateOrderStatus('OUT_FOR_DELIVERY');
  };

  // Handle delivery confirmation click (show confirmation modal)
  const handleDeliveryConfirm = () => {
    setIsConfirmModalOpen(true);
  };

  // Handle final delivery completion
  const completeDelivery = async () => {
    await updateOrderStatus('DELIVERED');
  };

  // Cancel confirmation modal
  const cancelConfirmation = () => {
    setIsConfirmModalOpen(false);
  };

  // Open Google Maps navigation
  const openNavigation = (address) => {
    // Format the address for Google Maps URL
    const formattedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`, '_blank');
  };

  // Call customer
  const callCustomer = (phoneNumber) => {
    setCustomerContactAttempted(true);
    window.location.href = `tel:${phoneNumber}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Return a loading state while fetching data
  if (loading) {
    return (
      <div className="delivery-order-container">
        <div className="loading-message">Loading order details...</div>
      </div>
    );
  }

  // Return an error message if there was a problem
  if (error) {
    return (
      <div className="delivery-order-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/delivery/available-orders')} className="back-button">
            Back to Available Orders
          </button>
        </div>
      </div>
    );
  }

  // If no order found
  if (!order) {
    return (
      <div className="delivery-order-container">
        <div className="no-order-message">
          <p>Order not found</p>
          <button onClick={() => navigate('/delivery/available-orders')} className="back-button">
            Back to Available Orders
          </button>
        </div>
      </div>
    );
  }

  // Calculate which steps are complete
  const getStepStatus = (stepId) => {
    const stepIndex = DELIVERY_STEPS.findIndex(step => step.id === stepId);
    const currentIndex = DELIVERY_STEPS.findIndex(step => step.id === currentStatus);
    
    if (currentIndex >= stepIndex) {
      return 'completed';
    }
    return '';
  };

  return (
    <div className="delivery-order-container">
      <div className="delivery-order-header">
        <h1>Order #{orderId}</h1>
        <div className="status-badge">{currentStatus.replace(/_/g, ' ')}</div>
      </div>

      {/* Delivery Progress Tracker */}
      <div className="delivery-progress">
        {DELIVERY_STEPS.map((step, index) => (
          <div key={step.id} className={`progress-step ${getStepStatus(step.id)}`}>
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step.label}</div>
            {index < DELIVERY_STEPS.length - 1 && <div className="connector-line"></div>}
          </div>
        ))}
      </div>

      <div className="order-details-card">
        {/* Restaurant Info */}
        <div className="location-card restaurant-card">
          <h2>Pickup From</h2>
          <div className="location-details">
            <h3>{order.restaurantName}</h3>
            <p>{order.restaurant?.address || order.pickupAddress || "Address not available"}</p>
            <p>Phone: {order.restaurant?.phone || "Not available"}</p>
          </div>
          <button 
            className="navigation-button"
            onClick={() => openNavigation(order.restaurant?.address || order.pickupAddress)}
          >
            Navigate to Restaurant
          </button>
        </div>

        {/* Customer Info */}
        <div className="location-card customer-card">
          <h2>Deliver To</h2>
          <div className="location-details">
            <h3>{order.userName}</h3>
            <p>{order.deliveryAddress}</p>
            <p>Phone: {order.userPhone || "Not available"}</p>
          </div>
          <div className="customer-actions">
            <button 
              className="call-button"
              onClick={() => callCustomer(order.userPhone)}
              disabled={!order.userPhone}
            >
              Call Customer
            </button>
            <button 
              className="navigation-button"
              onClick={() => openNavigation(order.deliveryAddress)}
            >
              Navigate to Customer
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-section">
          <h2>Order Items</h2>
          <ul className="items-list">
            {order.orderItems?.map(item => (
              <li key={item.id} className="order-item">
                <span className="item-quantity">{item.quantity}x</span>
                <span className="item-name">{item.menuItemName}</span>
                <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="special-instructions">
            <h2>Special Instructions</h2>
            <p>{order.specialInstructions}</p>
          </div>
        )}

        {/* Delivery Notes */}
        <div className="delivery-notes">
          <h2>Delivery Notes</h2>
          <textarea
            placeholder="Add notes about the delivery (optional)"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="delivery-actions">
          {currentStatus === 'READY_FOR_PICKUP' && (
            <button 
              className="action-button pickup-button"
              onClick={handlePickupConfirm}
            >
              Confirm Pickup from Restaurant
            </button>
          )}
          
          {currentStatus === 'OUT_FOR_DELIVERY' && (
            <button 
              className="action-button deliver-button"
              onClick={handleDeliveryConfirm}
            >
              Confirm Delivery to Customer
            </button>
          )}
          
          {currentStatus === 'DELIVERED' && (
            <div className="delivery-complete-message">
              <p>✓ Delivery completed successfully!</p>
              <button 
                className="action-button new-order-button"
                onClick={() => navigate('/delivery/available-orders')}
              >
                Find New Orders
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirm Delivery</h3>
            
            <p>Please confirm that you've delivered the order to the customer:</p>
            
            <div className="confirmation-checklist">
              <label className="checklist-item">
                <input 
                  type="checkbox" 
                  checked={customerContactAttempted}
                  onChange={() => setCustomerContactAttempted(!customerContactAttempted)} 
                />
                I've made contact with the customer
              </label>
            </div>
            
            <div className="modal-actions">
              <button onClick={cancelConfirmation} className="cancel-button">
                Cancel
              </button>
              <button 
                onClick={completeDelivery} 
                className="confirm-button"
                disabled={!customerContactAttempted}
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
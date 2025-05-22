// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userApi from '../api/userApi';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await userApi.getUserProfile();
        
        if (response.success) {
          setProfileData({
            name: response.data.name || '',
            email: response.data.email || '',
            phoneNumber: response.data.phoneNumber || '',
            address: response.data.address || ''
          });
        } else {
          setErrors({ form: response.error });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrors({ form: 'Failed to load user profile. Please try again later.' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear success message when user starts editing
    if (success) {
      setSuccess('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (profileData.phoneNumber && !profileData.phoneNumber.match(/^\+?[0-9]{10,15}$/)) {
      newErrors.phoneNumber = 'Phone number must be 10-15 digits with an optional + prefix';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const response = await userApi.updateUserProfile({
          name: profileData.name,
          phoneNumber: profileData.phoneNumber,
          address: profileData.address
        });
        
        if (response.success) {
          setSuccess('Profile updated successfully!');
        } else {
          if (response.validationErrors) {
            setErrors(response.validationErrors);
          } else {
            setErrors({ form: response.error });
          }
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setErrors({ form: 'An unexpected error occurred. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Update your personal information</p>
      </div>
      
      <div className="profile-card">
        {success && <div className="success-message">{success}</div>}
        {errors.form && <div className="error-message">{errors.form}</div>}
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              disabled
              className="disabled-input"
            />
            <small>Email cannot be changed</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. +1234567890"
              className={errors.phoneNumber ? 'input-error' : ''}
            />
            {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Default Delivery Address</label>
            <textarea
              id="address"
              name="address"
              value={profileData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter your full address"
              className={errors.address ? 'input-error' : ''}
            ></textarea>
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {user && user.role === 'DELIVERY_PERSONNEL' && (
        <div className="delivery-specific-section profile-card">
          <h2>Delivery Information</h2>
          <p>Additional settings for delivery personnel.</p>
          
          <div className="availability-toggle">
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Available for Deliveries</span>
          </div>
          
          <div className="delivery-settings">
            <h3>Delivery Preferences</h3>
            <p>This section is for future features like preferred delivery areas, maximum distance, etc.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
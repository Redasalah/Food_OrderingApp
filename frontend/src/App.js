// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import RestaurantListing from './pages/RestaurantListing';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './components/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from './pages/NotFound';


import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import CreateRestaurant from './pages/restaurant/CreateRestaurant';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import RestaurantNavbar from './components/RestaurantNavbar';
import Footer from './components/Footer';



// Styles
import './App.css';

<RestaurantDashboard />

const CreateRestaurantTemp = () => (
  <div style={{ padding: '40px' }}>
    <h1>Create Restaurant</h1>
    <p>Setup your restaurant profile and start receiving orders.</p>
  </div>
);

const ManageMenuTemp = () => (
  <div style={{ padding: '40px' }}>
    <h1>Menu Management</h1>
    <p>Add, edit, and organize your menu items here.</p>
  </div>
);

const OrderProcessingTemp = () => (
  <div style={{ padding: '40px' }}>
    <h1>Order Processing</h1>
    <p>View and manage incoming orders.</p>
  </div>
);

const RestaurantSettingsTemp = () => (
  <div style={{ padding: '40px' }}>
    <h1>Restaurant Settings</h1>
    <p>Configure your restaurant settings and preferences.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected Dashboard route for customers */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <Navbar />
                    <Dashboard />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              {/* Restaurant Owner Routes */}
              <Route
                path="/restaurant/dashboard"
                element={
                  <ProtectedRoute requiredRole="RESTAURANT_STAFF">
                    <RestaurantNavbar />
                    <RestaurantDashboard />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              

<Route
  path="/restaurant/create"
  element={
    <ProtectedRoute requiredRole="RESTAURANT_STAFF">
      <RestaurantNavbar />
      <CreateRestaurant />
      <Footer />
    </ProtectedRoute>
  }
/>

              <Route
                path="/restaurant/menu"
                element={
                  <ProtectedRoute requiredRole="RESTAURANT_STAFF">
                    <RestaurantNavbar />
                    <ManageMenuTemp />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant/orders"
                element={
                  <ProtectedRoute requiredRole="RESTAURANT_STAFF">
                    <RestaurantNavbar />
                    <OrderProcessingTemp />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant/settings"
                element={
                  <ProtectedRoute requiredRole="RESTAURANT_STAFF">
                    <RestaurantNavbar />
                    <RestaurantSettingsTemp />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              {/* Other existing routes */}
              <Route
                path="/restaurants"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <RestaurantListing />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/restaurants/:id"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <RestaurantDetail />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Cart />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Checkout />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/order-confirmation"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <OrderConfirmation />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
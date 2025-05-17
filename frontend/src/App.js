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

import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';


// Delivery Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AvailableOrders from './pages/delivery/AvailableOrders';
import DeliveryOrderPage from './pages/delivery/DeliveryOrderPage';

// Restaurant Pages
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import CreateRestaurant from './pages/restaurant/CreateRestaurant';
import ManageMenu from './pages/restaurant/ManageMenu';
import OrderProcessing from './pages/restaurant/OrderProcessing';
import RestaurantSettings from './pages/restaurant/RestaurantSettings';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import RestaurantNavbar from './components/RestaurantNavbar';
import Footer from './components/Footer';

// Styles
import './App.css';

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
                    <ManageMenu />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/restaurant/orders"
                element={
                  <ProtectedRoute requiredRole="RESTAURANT_STAFF">
                    <RestaurantNavbar />
                    <OrderProcessing />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/restaurant/settings"
                element={
                  <ProtectedRoute requiredRole="RESTAURANT_STAFF">
                    <RestaurantNavbar />
                    <RestaurantSettings />
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

              {/* Protected routes - Delivery */}
              <Route
                path="/delivery/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <DeliveryDashboard />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delivery/available-orders"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <AvailableOrders />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delivery/order/:orderId"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <DeliveryOrderPage />
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* Order Routes */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <Navbar />
                    <OrderHistory />
                    <Footer />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <Navbar />
                    <OrderTracking />
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
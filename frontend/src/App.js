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

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
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
              
              {/* Protected Dashboard route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Dashboard />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              
              {/* Restaurant routes */}
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
              
              {/* Cart and checkout routes */}
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
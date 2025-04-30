import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-overlay">
          <div className="landing-content">
            <h1>Quicky</h1>
            <p className="landing-subtitle">
              Delicious food delivered to your doorstep
            </p>
            <div className="landing-buttons">
              <Link to="/signup" className="landing-button primary">
                Sign Up
              </Link>
              <Link to="/login" className="landing-button secondary">
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2>How It Works</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🍕</div>
            <h3>Browse Restaurants</h3>
            <p>Explore local restaurants and their menus at your fingertips</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>Place Your Order</h3>
            <p>Select your favorite meals and add them to your cart</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Track your order in real-time until it arrives at your door</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to order?</h2>
        <p>Create an account and start ordering your favorite food now!</p>
        <Link to="/signup" className="cta-button">
          Get Started
        </Link>
      </section>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Quicky. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
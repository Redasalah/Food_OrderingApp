// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Cart Context
const CartContext = createContext();

// Custom hook to use the Cart Context
export function useCart() {
  return useContext(CartContext);
}

// Cart Provider Component
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setItems(parsedCart);
    }
  }, []);
  
  // Update localStorage and calculate totals whenever cart changes
  useEffect(() => {
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(items));
    
    // Calculate total items and price
    let itemCount = 0;
    let price = 0;
    
    items.forEach(item => {
      itemCount += item.quantity;
      price += item.price * item.quantity;
    });
    
    setTotalItems(itemCount);
    setSubtotal(price);
  }, [items]);
  
  // Add item to cart
  const addItem = (item) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };
  
  // Remove item from cart
  const removeItem = (itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };
  
  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setItems([]);
  };
  
  // Check if cart contains items from multiple restaurants
  const hasMultipleRestaurants = () => {
    const restaurantIds = new Set(items.map(item => item.restaurantInfo?.id).filter(Boolean));
    return restaurantIds.size > 1;
  };
  
  // Get the restaurant ID if all items are from one restaurant
  const getSingleRestaurantId = () => {
    if (hasMultipleRestaurants() || items.length === 0) {
      return null;
    }
    return items[0].restaurantInfo?.id;
  };
  
  // Create the context value
  const value = {
    cart,
    items: cart,               // Add items alias for components expecting it
    totalItems,
    totalPrice,
    subtotal: totalPrice,      // Add subtotal alias for components expecting it
    addToCart,
    addItem: addToCart,        // Add addItem alias for components using this name
    removeFromCart,
    removeItem: removeFromCart, // Add removeItem alias for consistency
    updateQuantity,
    clearCart
  };
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

package com.foodordering.models;

public enum OrderStatus {
    PENDING,          // Initial order state
    CONFIRMED,        // Order accepted by restaurant
    PREPARING,        // Restaurant is preparing the food
    READY_FOR_PICKUP, // Order is ready to be picked up
    OUT_FOR_DELIVERY, // Order is with delivery personnel
    DELIVERED,        // Order successfully delivered
    CANCELLED         // Order was cancelled
}
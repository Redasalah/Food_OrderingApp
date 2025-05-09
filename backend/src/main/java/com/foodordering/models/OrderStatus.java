package com.foodordering.models;

public enum OrderStatus {
    PENDING,         // Order has been placed but not yet accepted by the restaurant
    ACCEPTED,        // Restaurant has accepted the order
    PREPARING,       // Restaurant is preparing the food
    READY_FOR_PICKUP, // Food is ready for delivery personnel to pickup
    OUT_FOR_DELIVERY, // Delivery personnel has picked up and is delivering
    DELIVERED,       // Order has been delivered to customer
    COMPLETED,       // Order completed successfully
    CANCELLED,       // Order was cancelled
    REJECTED         // Order was rejected by restaurant
}
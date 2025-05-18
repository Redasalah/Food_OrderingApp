// backend/src/main/java/com/foodordering/controllers/DeliveryController.java
package com.foodordering.controllers;

import com.foodordering.dtos.responses.OrderResponse;
import com.foodordering.models.OrderStatus;
import com.foodordering.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private OrderService orderService;
    
    // Get orders that are ready for pickup (available for delivery)
    @GetMapping("/available-orders")
    public ResponseEntity<List<OrderResponse>> getAvailableOrders() {
        List<OrderResponse> availableOrders = orderService.getOrdersByStatus(OrderStatus.READY_FOR_PICKUP);
        return ResponseEntity.ok(availableOrders);
    }
    
    // Get orders that are currently being delivered
    @GetMapping("/active-orders")
    public ResponseEntity<List<OrderResponse>> getActiveOrders() {
        List<OrderResponse> activeOrders = orderService.getOrdersByStatus(OrderStatus.OUT_FOR_DELIVERY);
        return ResponseEntity.ok(activeOrders);
    }
    
    // Accept an order for delivery
    @PostMapping("/orders/{orderId}/accept")
    public ResponseEntity<OrderResponse> acceptOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        String email = userDetails.getUsername();
        OrderResponse acceptedOrder = orderService.assignOrderToDelivery(email, orderId);
        return ResponseEntity.ok(acceptedOrder);
    }
    
    // Mark an order as delivered
    @PutMapping("/orders/{orderId}/deliver")
    public ResponseEntity<OrderResponse> markOrderDelivered(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        String email = userDetails.getUsername();
        OrderResponse deliveredOrder = orderService.updateOrderStatus(email, orderId, OrderStatus.DELIVERED);
        return ResponseEntity.ok(deliveredOrder);
    }
}
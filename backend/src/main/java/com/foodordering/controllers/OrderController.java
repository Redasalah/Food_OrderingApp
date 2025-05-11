// backend/src/main/java/com/foodordering/controllers/OrderController.java
package com.foodordering.controllers;

import com.foodordering.dtos.requests.OrderRequest;
import com.foodordering.dtos.responses.OrderResponse;
import com.foodordering.models.OrderStatus;
import com.foodordering.services.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Create a new order
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest orderRequest) {
        String email = userDetails.getUsername();
        OrderResponse createdOrder = orderService.createOrder(email, orderRequest);
        return ResponseEntity.ok(createdOrder);
    }

    // Get user's orders (optionally filtered by status)
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status) {
        String email = userDetails.getUsername();
        
        // If status is provided, filter orders by status
        if (status != null) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                return ResponseEntity.ok(orderService.getUserOrdersByStatus(email, orderStatus));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        // If no status provided, return all user orders
        return ResponseEntity.ok(orderService.getUserOrders(email));
    }

    // Get a specific order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        String email = userDetails.getUsername();
        OrderResponse order = orderService.getOrderById(email, orderId);
        return ResponseEntity.ok(order);
    }

    // Cancel an order
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        String email = userDetails.getUsername();
        OrderResponse cancelledOrder = orderService.cancelOrder(email, orderId);
        return ResponseEntity.ok(cancelledOrder);
    }
}
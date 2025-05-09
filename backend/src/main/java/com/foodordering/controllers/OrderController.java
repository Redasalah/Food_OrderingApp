package com.foodordering.controllers;

import com.foodordering.dtos.requests.OrderItemRequest;
import com.foodordering.dtos.requests.OrderRequest;
import com.foodordering.dtos.responses.ApiResponse;
import com.foodordering.dtos.responses.OrderResponse;
import com.foodordering.exceptions.BadRequestException;
import com.foodordering.exceptions.ResourceNotFoundException;
import com.foodordering.models.MenuItem;
import com.foodordering.models.Order;
import com.foodordering.models.OrderStatus;
import com.foodordering.models.User;
import com.foodordering.repositories.MenuItemRepository;
import com.foodordering.repositories.UserRepository;
import com.foodordering.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    // Create a thread pool for handling order processing
    private final ExecutorService orderProcessorPool = Executors.newFixedThreadPool(10);
    
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest orderRequest) {
        
        User user = getUserFromUserDetails(userDetails);
        
        // Validate order items using multithreading
        List<CompletableFuture<MenuItem>> menuItemFutures = orderRequest.getOrderItems().stream()
                .map(item -> CompletableFuture.supplyAsync(() -> 
                        menuItemRepository.findById(item.getMenuItemId())
                                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + item.getMenuItemId())),
                        orderProcessorPool))
                .collect(Collectors.toList());
        
        // Wait for all validations to complete
        CompletableFuture.allOf(menuItemFutures.toArray(new CompletableFuture[0])).join();
        
        // Create the order asynchronously
        CompletableFuture<OrderResponse> futureOrder = CompletableFuture.supplyAsync(() -> 
                orderService.createOrder(user.getId(), orderRequest), orderProcessorPool);
        
        // Get the result
        OrderResponse createdOrder = futureOrder.join();
        
        return ResponseEntity.ok(createdOrder);
    }
    
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) OrderStatus status) {
        
        User user = getUserFromUserDetails(userDetails);
        
        List<OrderResponse> orders = orderService.getUserOrders(user.getId(), status);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        
        User user = getUserFromUserDetails(userDetails);
        
        OrderResponse order = orderService.getOrderById(id, user.getId());
        return ResponseEntity.ok(order);
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        
        User user = getUserFromUserDetails(userDetails);
        
        boolean cancelled = orderService.cancelOrder(id, user.getId());
        
        if (cancelled) {
            return ResponseEntity.ok(new ApiResponse(true, "Order cancelled successfully"));
        } else {
            throw new BadRequestException("Unable to cancel order. It may already be in processing.");
        }
    }
    
    // For restaurant staff to update order status
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        
        User user = getUserFromUserDetails(userDetails);
        
        // Execute status update asynchronously
        CompletableFuture<OrderResponse> futureOrder = CompletableFuture.supplyAsync(() -> 
                orderService.updateOrderStatus(id, user.getId(), status), orderProcessorPool);
        
        // Get the result
        OrderResponse updatedOrder = futureOrder.join();
        
        return ResponseEntity.ok(updatedOrder);
    }
    
    // Helper method to get user from UserDetails
    private User getUserFromUserDetails(UserDetails userDetails) {
        String email = userDetails.getUsername();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
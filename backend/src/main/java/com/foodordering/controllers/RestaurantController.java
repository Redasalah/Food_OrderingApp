package com.foodordering.controllers;
import java.util.Map;
import com.foodordering.dtos.requests.RestaurantRequest;
import com.foodordering.dtos.responses.ApiResponse;
import com.foodordering.dtos.responses.OrderResponse;
import com.foodordering.dtos.responses.RestaurantResponse;
import com.foodordering.exceptions.ResourceNotFoundException;
import com.foodordering.models.OrderStatus;
import com.foodordering.repositories.UserRepository;
import com.foodordering.services.OrderService;
import com.foodordering.services.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RestaurantController {
@Autowired
    private OrderService orderService;

    @Autowired
    private RestaurantService restaurantService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create a new restaurant
    @PostMapping("/restaurants/create")
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RestaurantRequest restaurantRequest) {
        // Get user ID from JWT token
        String email = userDetails.getUsername();
        Long userId = getUserIdFromEmail(email);
        
        RestaurantResponse createdRestaurant = restaurantService.createRestaurant(userId, restaurantRequest);
        return ResponseEntity.ok(createdRestaurant);
    }
    
    // Get restaurants owned by the current user
    @GetMapping("/restaurants/owner")
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Long userId = getUserIdFromEmail(email);
        
        List<RestaurantResponse> restaurants = restaurantService.getRestaurantsByOwner(userId);
        return ResponseEntity.ok(restaurants);
    }
    
    // Get all restaurants (public endpoint)
    @GetMapping("/public/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        List<RestaurantResponse> restaurants = restaurantService.getAllRestaurants();
        return ResponseEntity.ok(restaurants);
    }
    
    // Get a specific restaurant by ID (public endpoint)
    @GetMapping("/public/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable Long id) {
        RestaurantResponse restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }
 


    // Get orders for a specific restaurant
@GetMapping("/restaurants/{restaurantId}/orders")
public ResponseEntity<List<OrderResponse>> getRestaurantOrders(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long restaurantId,
        @RequestParam(required = false) OrderStatus status
) {
    String email = userDetails.getUsername();
    
    // This correctly calls the method with the right number of parameters
    List<OrderResponse> orders = orderService.getRestaurantOrdersByStatus(email, restaurantId, status);
    return ResponseEntity.ok(orders);
}
  
      // Process order status for restaurant staff
      @PutMapping("/orders/{orderId}/process")
      public ResponseEntity<OrderResponse> processOrderStatus(
              @AuthenticationPrincipal UserDetails userDetails,
              @PathVariable Long orderId,
              @RequestBody Map<String, String> statusUpdate) {
          
          String email = userDetails.getUsername();
          OrderStatus newStatus = OrderStatus.valueOf(statusUpdate.get("status"));
          OrderResponse updatedOrder = orderService.processInitialOrderStages(email, orderId, newStatus);
          
          return ResponseEntity.ok(updatedOrder);
      }
    // Update a restaurant
    @PutMapping("/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest restaurantRequest) {
        String email = userDetails.getUsername();
        Long userId = getUserIdFromEmail(email);
        
        RestaurantResponse updatedRestaurant = restaurantService.updateRestaurant(userId, id, restaurantRequest);
        return ResponseEntity.ok(updatedRestaurant);
    }
    
    // Delete a restaurant
    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<ApiResponse> deleteRestaurant(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        String email = userDetails.getUsername();
        Long userId = getUserIdFromEmail(email);
        
        restaurantService.deleteRestaurant(userId, id);
        return ResponseEntity.ok(new ApiResponse(true, "Restaurant deleted successfully"));
    }
    




   
    // Helper method to get user ID from email
    private Long getUserIdFromEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email))
            .getId();
    }
}
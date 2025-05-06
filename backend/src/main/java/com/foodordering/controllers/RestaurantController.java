// backend/src/main/java/com/foodordering/controllers/RestaurantController.java
package com.foodordering.controllers;

import com.foodordering.dtos.requests.RestaurantRequest;
import com.foodordering.dtos.responses.RestaurantResponse;
import com.foodordering.services.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.foodordering.exceptions.ResourceNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;
    
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
    
    @GetMapping("/restaurants/owner")

    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Long userId = getUserIdFromEmail(email);
        
        List<RestaurantResponse> restaurants = restaurantService.getRestaurantsByOwner(userId);
        return ResponseEntity.ok(restaurants);
    }
    
    @GetMapping("/public/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        List<RestaurantResponse> restaurants = restaurantService.getAllRestaurants();
        return ResponseEntity.ok(restaurants);
    }
    
    @GetMapping("/public/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable Long id) {
        RestaurantResponse restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }
    
    // Helper method to get user ID from email
    private Long getUserIdFromEmail(String email) {
        // In a real implementation, you would look up the user ID from the UserRepository
        // For simplicity, we're using a mock method here
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email))
            .getId();
    }
    
    @Autowired
    private com.foodordering.repositories.UserRepository userRepository;
}
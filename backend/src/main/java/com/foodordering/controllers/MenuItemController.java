// backend/src/main/java/com/foodordering/controllers/MenuItemController.java
package com.foodordering.controllers;

import com.foodordering.dtos.requests.MenuItemRequest;
import com.foodordering.dtos.responses.ApiResponse;
import com.foodordering.dtos.responses.MenuItemResponse;
import com.foodordering.repositories.UserRepository;
import com.foodordering.services.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/restaurants/{restaurantId}/menu-items")

    public ResponseEntity<MenuItemResponse> createMenuItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long restaurantId,
            @Valid @RequestBody MenuItemRequest menuItemRequest) {
        
        String email = userDetails.getUsername();
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.foodordering.exceptions.ResourceNotFoundException("User not found"))
                .getId();
        
        MenuItemResponse createdMenuItem = menuItemService.createMenuItem(userId, restaurantId, menuItemRequest);
        return ResponseEntity.ok(createdMenuItem);
    }
    
    @GetMapping("/public/restaurants/{restaurantId}/menu-items")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByRestaurant(
            @PathVariable Long restaurantId) {
        List<MenuItemResponse> menuItems = menuItemService.getMenuItemsByRestaurant(restaurantId);
        return ResponseEntity.ok(menuItems);
    }
    
    @GetMapping("/public/menu-items/{id}")
    public ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable Long id) {
        MenuItemResponse menuItem = menuItemService.getMenuItemById(id);
        return ResponseEntity.ok(menuItem);
    }
    
    @PutMapping("/menu-items/{id}")
    
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest menuItemRequest) {
        
        String email = userDetails.getUsername();
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.foodordering.exceptions.ResourceNotFoundException("User not found"))
                .getId();
        
        MenuItemResponse updatedMenuItem = menuItemService.updateMenuItem(userId, id, menuItemRequest);
        return ResponseEntity.ok(updatedMenuItem);
    }
    
    @DeleteMapping("/menu-items/{id}")
 
    public ResponseEntity<ApiResponse> deleteMenuItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        
        String email = userDetails.getUsername();
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.foodordering.exceptions.ResourceNotFoundException("User not found"))
                .getId();
        
        menuItemService.deleteMenuItem(userId, id);
        return ResponseEntity.ok(new ApiResponse(true, "Menu item deleted successfully"));
    }
}
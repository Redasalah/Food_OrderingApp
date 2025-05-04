// backend/src/main/java/com/foodordering/services/MenuItemService.java
package com.foodordering.services;

import com.foodordering.dtos.requests.MenuItemRequest;
import com.foodordering.dtos.responses.MenuItemResponse;
import com.foodordering.exceptions.ResourceNotFoundException;
import com.foodordering.models.MenuItem;
import com.foodordering.models.Restaurant;
import com.foodordering.repositories.MenuItemRepository;
import com.foodordering.repositories.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
 
    
    public MenuItemResponse createMenuItem(Long userId, Long restaurantId, MenuItemRequest menuItemRequest) {
        // Check if user owns the restaurant
        Restaurant restaurant = restaurantRepository.findByIdAndOwnerId(restaurantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found or you don't have permission"));
        
        MenuItem menuItem = new MenuItem();
        menuItem.setName(menuItemRequest.getName());
        menuItem.setDescription(menuItemRequest.getDescription());
        menuItem.setPrice(menuItemRequest.getPrice());
        menuItem.setImageUrl(menuItemRequest.getImageUrl());
        menuItem.setCategory(menuItemRequest.getCategory());
        menuItem.setPopular(menuItemRequest.isPopular());
        menuItem.setRestaurant(restaurant);
        
        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        
        return convertToResponse(savedMenuItem);
    }
    
    public List<MenuItemResponse> getMenuItemsByRestaurant(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }
        
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantId(restaurantId);
        
        return menuItems.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public MenuItemResponse getMenuItemById(Long menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + menuItemId));
        
        return convertToResponse(menuItem);
    }
    
    public MenuItemResponse updateMenuItem(Long userId, Long menuItemId, MenuItemRequest menuItemRequest) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + menuItemId));
        
        // Check if user owns the restaurant
        Restaurant restaurant = menuItem.getRestaurant();
        if (!restaurant.getOwner().getId().equals(userId)) {
            throw new ResourceNotFoundException("You don't have permission to update this menu item");
        }
        
        // Update menu item properties
        menuItem.setName(menuItemRequest.getName());
        menuItem.setDescription(menuItemRequest.getDescription());
        menuItem.setPrice(menuItemRequest.getPrice());
        menuItem.setImageUrl(menuItemRequest.getImageUrl());
        menuItem.setCategory(menuItemRequest.getCategory());
        menuItem.setPopular(menuItemRequest.isPopular());
        
        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        
        return convertToResponse(updatedMenuItem);
    }
    
    public void deleteMenuItem(Long userId, Long menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + menuItemId));
        
        // Check if user owns the restaurant
        Restaurant restaurant = menuItem.getRestaurant();
        if (!restaurant.getOwner().getId().equals(userId)) {
            throw new ResourceNotFoundException("You don't have permission to delete this menu item");
        }
        
        menuItemRepository.delete(menuItem);
    }
    
    private MenuItemResponse convertToResponse(MenuItem menuItem) {
        MenuItemResponse response = new MenuItemResponse();
        response.setId(menuItem.getId());
        response.setName(menuItem.getName());
        response.setDescription(menuItem.getDescription());
        response.setPrice(menuItem.getPrice());
        response.setImageUrl(menuItem.getImageUrl());
        response.setCategory(menuItem.getCategory());
        response.setPopular(menuItem.isPopular());
        return response;
    }
}
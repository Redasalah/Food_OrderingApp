package com.foodordering.services;

import com.foodordering.dtos.requests.RestaurantRequest;
import com.foodordering.dtos.responses.MenuItemResponse;
import com.foodordering.dtos.responses.RestaurantResponse;
import com.foodordering.exceptions.ResourceNotFoundException;
import com.foodordering.models.MenuItem;
import com.foodordering.models.Restaurant;
import com.foodordering.models.User;
import com.foodordering.repositories.RestaurantRepository;
import com.foodordering.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public RestaurantResponse createRestaurant(Long userId, RestaurantRequest restaurantRequest) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // No role check - allow any user to create a restaurant
        
        Restaurant restaurant = new Restaurant();
        restaurant.setName(restaurantRequest.getName());
        restaurant.setCuisine(restaurantRequest.getCuisine());
        restaurant.setDescription(restaurantRequest.getDescription());
        restaurant.setAddress(restaurantRequest.getAddress());
        restaurant.setPhoneNumber(restaurantRequest.getPhoneNumber());
        restaurant.setImageUrl(restaurantRequest.getImageUrl());
        
        if (restaurantRequest.getDeliveryFee() != null) {
            restaurant.setDeliveryFee(restaurantRequest.getDeliveryFee());
        }
        
        if (restaurantRequest.getDeliveryTime() != null) {
            restaurant.setDeliveryTime(restaurantRequest.getDeliveryTime());
        }
        
        if (restaurantRequest.getPriceRange() != null) {
            restaurant.setPriceRange(restaurantRequest.getPriceRange());
        }
        
        // Set the restaurant as active by default
        restaurant.setActive(true);
        
        restaurant.setOwner(owner);
        
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        
        return convertToResponse(savedRestaurant);
    }
    
    public List<RestaurantResponse> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        return restaurants.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        
        return convertToResponse(restaurant);
    }
    
    public List<RestaurantResponse> getRestaurantsByOwner(Long ownerId) {
        List<Restaurant> restaurants = restaurantRepository.findByOwnerId(ownerId);
        return restaurants.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public RestaurantResponse updateRestaurant(Long userId, Long restaurantId, RestaurantRequest restaurantRequest) {
        Restaurant restaurant = restaurantRepository.findByIdAndOwnerId(restaurantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found or you don't have permission to update it"));
        
        // Update restaurant details
        restaurant.setName(restaurantRequest.getName());
        restaurant.setCuisine(restaurantRequest.getCuisine());
        restaurant.setDescription(restaurantRequest.getDescription());
        restaurant.setAddress(restaurantRequest.getAddress());
        restaurant.setPhoneNumber(restaurantRequest.getPhoneNumber());
        restaurant.setImageUrl(restaurantRequest.getImageUrl());
        
        if (restaurantRequest.getDeliveryFee() != null) {
            restaurant.setDeliveryFee(restaurantRequest.getDeliveryFee());
        }
        
        if (restaurantRequest.getDeliveryTime() != null) {
            restaurant.setDeliveryTime(restaurantRequest.getDeliveryTime());
        }
        
        if (restaurantRequest.getPriceRange() != null) {
            restaurant.setPriceRange(restaurantRequest.getPriceRange());
        }
        
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        
        return convertToResponse(updatedRestaurant);
    }
    
    public void deleteRestaurant(Long userId, Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findByIdAndOwnerId(restaurantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found or you don't have permission to delete it"));
        
        restaurantRepository.delete(restaurant);
    }
    
    private RestaurantResponse convertToResponse(Restaurant restaurant) {
        RestaurantResponse response = new RestaurantResponse();
        response.setId(restaurant.getId());
        response.setName(restaurant.getName());
        response.setCuisine(restaurant.getCuisine());
        response.setDescription(restaurant.getDescription());
        response.setAddress(restaurant.getAddress());
        response.setPhoneNumber(restaurant.getPhoneNumber());
        response.setImageUrl(restaurant.getImageUrl());
        response.setDeliveryFee(restaurant.getDeliveryFee());
        response.setDeliveryTime(restaurant.getDeliveryTime());
        response.setPriceRange(restaurant.getPriceRange());
        response.setRating(restaurant.getRating());
        response.setActive(restaurant.getActive());
        
        // Convert menu items
        if (restaurant.getMenuItems() != null && !restaurant.getMenuItems().isEmpty()) {
            List<MenuItemResponse> menuItemResponses = restaurant.getMenuItems().stream()
                    .map(this::convertMenuItemToResponse)
                    .collect(Collectors.toList());
            
            response.setMenuItems(menuItemResponses);
        }
        
        return response;
    }
    private MenuItemResponse convertMenuItemToResponse(MenuItem menuItem) {
        MenuItemResponse response = new MenuItemResponse();
        response.setId(menuItem.getId());
        response.setName(menuItem.getName());
        response.setDescription(menuItem.getDescription());
        response.setPrice(menuItem.getPrice());
        response.setImageUrl(menuItem.getImageUrl());
        response.setCategory(menuItem.getCategory());
        response.setPopular(menuItem.isPopular());
        response.setAvailable(menuItem.isAvailable());
        return response;
    }
}
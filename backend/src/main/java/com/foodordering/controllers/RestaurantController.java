package com.foodordering.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/restaurants")
public class RestaurantController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRestaurants() {
        // Temporary response until you implement the real repository logic
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Restaurant list endpoint working");
        response.put("status", "success");
        
        return ResponseEntity.ok(response);
    }
}
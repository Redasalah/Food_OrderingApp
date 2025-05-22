package com.foodordering.controllers;

import com.foodordering.dtos.requests.UserProfileRequest;
import com.foodordering.dtos.responses.ApiResponse;
import com.foodordering.dtos.responses.UserProfileResponse;
import com.foodordering.exceptions.ResourceNotFoundException;
import com.foodordering.models.User;
import com.foodordering.repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        UserProfileResponse profile = new UserProfileResponse();
        profile.setId(user.getId());
        profile.setEmail(user.getEmail());
        profile.setName(user.getName());
        profile.setPhoneNumber(user.getPhoneNumber());
        
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserProfileRequest profileRequest) {
        
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Update user information
        if (profileRequest.getName() != null && !profileRequest.getName().isEmpty()) {
            user.setName(profileRequest.getName());
        }
        
        if (profileRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(profileRequest.getPhoneNumber());
        }
        
        // Save updated user
        userRepository.save(user);
        
        return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully"));
    }
}
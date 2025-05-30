package com.foodordering.controllers;

import com.foodordering.dtos.requests.LoginRequest;
import com.foodordering.dtos.requests.RegisterRequest;
import com.foodordering.dtos.responses.ApiResponse;
import com.foodordering.dtos.responses.AuthResponse;
import com.foodordering.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Add explicit support for OPTIONS method
    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> options() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
    }
    
    // Add a GET endpoint for checking auth status
    @GetMapping("/status")
    public ResponseEntity<ApiResponse> checkAuthStatus() {
        return ResponseEntity.ok(new ApiResponse(true, "Authentication endpoint is working"));
    }
}
package com.foodordering.services;

import com.foodordering.dtos.requests.LoginRequest;
import com.foodordering.dtos.requests.RegisterRequest;
import com.foodordering.dtos.responses.ApiResponse;
import com.foodordering.dtos.responses.AuthResponse;
import com.foodordering.exceptions.BadRequestException;
import com.foodordering.models.Role;
import com.foodordering.models.User;
import com.foodordering.repositories.UserRepository;
import com.foodordering.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = tokenProvider.generateToken(authentication);
        
        // Modified to work with a single 'name' field instead of firstName + lastName
        return new AuthResponse(
                token,
                user.getId(),
                user.getName(), // Use name directly instead of concatenating
                user.getEmail(),
                user.getRole()
        );
    }

    public ApiResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already taken");
        }

        User user = new User();
        // Combine firstName and lastName into a single name field
        user.setName(registerRequest.getFirstName() + " " + registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        
        // Convert string role to enum
        try {
            user.setRole(Role.valueOf(registerRequest.getRole()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + registerRequest.getRole());
        }

        userRepository.save(user);

        return new ApiResponse(true, "User registered successfully");
    }
}
package com.foodordering.models;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(nullable = true)
    private String phoneNumber;
    
    public User() {
    }
    
    public User(Long id, String name, String email, String password, Role role, String phoneNumber) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phoneNumber = phoneNumber;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    // For compatibility with the current code that uses firstName and lastName
    public String getFirstName() {
        if (name == null) return "";
        int spaceIndex = name.indexOf(' ');
        return spaceIndex > 0 ? name.substring(0, spaceIndex) : name;
    }
    
    public void setFirstName(String firstName) {
        // If lastName is already set through the getter, combine them
        String lastName = getLastName();
        if (lastName.isEmpty()) {
            this.name = firstName;
        } else {
            this.name = firstName + " " + lastName;
        }
    }
    
    public String getLastName() {
        if (name == null) return "";
        int spaceIndex = name.indexOf(' ');
        return spaceIndex > 0 ? name.substring(spaceIndex + 1) : "";
    }
    
    public void setLastName(String lastName) {
        // If firstName is already set through the getter, combine them
        String firstName = getFirstName();
        if (firstName.isEmpty()) {
            this.name = lastName;
        } else {
            this.name = firstName + " " + lastName;
        }
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
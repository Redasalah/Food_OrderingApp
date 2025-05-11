// backend/src/main/java/com/foodordering/repositories/OrderRepository.java
package com.foodordering.repositories;

import com.foodordering.models.Order;
import com.foodordering.models.OrderStatus;
import com.foodordering.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Find orders for a specific user, ordered by most recent first
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    // Find orders for a specific user with a specific status, ordered by most recent first
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, OrderStatus status);
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
List<Order> findByRestaurantIdAndStatusOrderByCreatedAtDesc(Long restaurantId, OrderStatus status);
    // Find a specific order for a user
    Optional<Order> findByIdAndUser(Long orderId, User user);
}
// backend/src/main/java/com/foodordering/repositories/OrderRepository.java
package com.foodordering.repositories;

import com.foodordering.models.Order;
import com.foodordering.models.OrderStatus;
import com.foodordering.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;



@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Find orders for a specific user, ordered by most recent first
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    // Find orders for a specific user with a specific status, ordered by most recent first
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, OrderStatus status);
    
    // Find orders by restaurant ID, ordered by most recent first
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    
    // Find orders by restaurant ID and status, ordered by most recent first
    List<Order> findByRestaurantIdAndStatusOrderByCreatedAtDesc(Long restaurantId, OrderStatus status);
    
    // Find a specific order for a user
    Optional<Order> findByIdAndUser(Long orderId, User user);
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByStatusAndCreatedAtBetween(
        @Param("status") OrderStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // If you prefer a method without @Query annotation
    List<Order> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
        OrderStatus status,
        LocalDateTime startDate,
        LocalDateTime endDate
    );
    // Find orders by status
    List<Order> findByStatus(OrderStatus status);
}
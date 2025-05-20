// backend/src/main/java/com/foodordering/controllers/DeliveryController.java
package com.foodordering.controllers;

import com.foodordering.dtos.responses.DeliveryDashboardResponse;
import com.foodordering.dtos.responses.OrderResponse;
import com.foodordering.models.Order;
import com.foodordering.models.OrderStatus;
import com.foodordering.repositories.OrderRepository;
import com.foodordering.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<DeliveryDashboardResponse> getDashboardData(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            DeliveryDashboardResponse dashboardResponse = new DeliveryDashboardResponse();

            // Get active delivery (first order in OUT_FOR_DELIVERY status)
            List<OrderResponse> activeOrders = orderService.getOrdersByStatus(OrderStatus.OUT_FOR_DELIVERY);
            dashboardResponse.setActiveDelivery(
                activeOrders.isEmpty() ? null : activeOrders.get(0)
            );

            // Calculate delivered orders today
            LocalDate today = LocalDate.now();
            List<Order> todayDeliveredOrders = orderRepository.findByStatusAndCreatedAtBetween(
                OrderStatus.DELIVERED, 
                today.atStartOfDay(), 
                today.atTime(LocalTime.MAX)
            );

            dashboardResponse.setDeliveredToday(todayDeliveredOrders.size());

            // Calculate total earnings today
            BigDecimal totalEarnings = todayDeliveredOrders.stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            dashboardResponse.setTotalEarningsToday(totalEarnings);

            // Get available orders
            List<OrderResponse> availableOrders = orderService.getOrdersByStatus(OrderStatus.READY_FOR_PICKUP);
            dashboardResponse.setAvailableOrders(availableOrders.size());

            // Simulate active status 
            dashboardResponse.setActive(true);

            // Recent deliveries
            List<DeliveryDashboardResponse.RecentDeliveryResponse> recentDeliveries = todayDeliveredOrders.stream()
                .limit(5)
                .map(order -> new DeliveryDashboardResponse.RecentDeliveryResponse(
                    order.getId(), 
                    order.getRestaurant().getName(), 
                    order.getCreatedAt().toString(), 
                    order.getTotal()
                ))
                .collect(Collectors.toList());
            
            dashboardResponse.setRecentDeliveries(recentDeliveries);

            return ResponseEntity.ok(dashboardResponse);
        } catch (Exception e) {
            // Fallback response
            DeliveryDashboardResponse fallbackResponse = new DeliveryDashboardResponse();
            fallbackResponse.setActiveDelivery(null);
            fallbackResponse.setDeliveredToday(0);
            fallbackResponse.setTotalEarningsToday(BigDecimal.ZERO);
            fallbackResponse.setActive(false);
            fallbackResponse.setAvailableOrders(0);
            fallbackResponse.setRecentDeliveries(Collections.emptyList());
            
            return ResponseEntity.ok(fallbackResponse);
        }
    }

    // Existing methods from your original DeliveryController
    @GetMapping("/available-orders")
    public ResponseEntity<List<OrderResponse>> getAvailableOrders() {
        List<OrderResponse> availableOrders = orderService.getOrdersByStatus(OrderStatus.READY_FOR_PICKUP);
        return ResponseEntity.ok(availableOrders);
    }
    
    @GetMapping("/active-orders")
    public ResponseEntity<List<OrderResponse>> getActiveOrders() {
        List<OrderResponse> activeOrders = orderService.getOrdersByStatus(OrderStatus.OUT_FOR_DELIVERY);
        return ResponseEntity.ok(activeOrders);
    }
    
    @PostMapping("/orders/{orderId}/accept")
    public ResponseEntity<OrderResponse> acceptOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        String email = userDetails.getUsername();
        OrderResponse acceptedOrder = orderService.assignOrderToDelivery(email, orderId);
        return ResponseEntity.ok(acceptedOrder);
    }
    
    @PutMapping("/orders/{orderId}/deliver")
    public ResponseEntity<OrderResponse> markOrderDelivered(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        String email = userDetails.getUsername();
        OrderResponse deliveredOrder = orderService.updateOrderStatus(email, orderId, OrderStatus.DELIVERED);
        return ResponseEntity.ok(deliveredOrder);
    }
}

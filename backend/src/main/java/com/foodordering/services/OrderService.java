package com.foodordering.services;

import com.foodordering.dtos.requests.OrderItemRequest;
import com.foodordering.dtos.requests.OrderRequest;
import com.foodordering.dtos.responses.OrderItemResponse;
import com.foodordering.dtos.responses.OrderResponse;
import com.foodordering.exceptions.BadRequestException;
import com.foodordering.exceptions.ResourceNotFoundException;
import com.foodordering.models.*;
import com.foodordering.repositories.MenuItemRepository;
import com.foodordering.repositories.OrderItemRepository;
import com.foodordering.repositories.OrderRepository;
import com.foodordering.repositories.RestaurantRepository;
import com.foodordering.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    // Thread pool for processing notifications
    private final ExecutorService notificationExecutor = Executors.newFixedThreadPool(5);
    
    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest orderRequest) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Find restaurant
        Restaurant restaurant = restaurantRepository.findById(orderRequest.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + orderRequest.getRestaurantId()));
        
        // Validate restaurant is active
        if (!restaurant.getActive()) {
            throw new BadRequestException("Restaurant is currently not accepting orders");
        }
        
        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setDeliveryFee(restaurant.getDeliveryFee());
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        order.setSpecialInstructions(orderRequest.getSpecialInstructions());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        
        // Add order items
        for (OrderItemRequest itemRequest : orderRequest.getOrderItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + itemRequest.getMenuItemId()));
            
            // Verify menu item belongs to the restaurant
            if (!menuItem.getRestaurant().getId().equals(restaurant.getId())) {
                throw new BadRequestException("Menu item doesn't belong to the selected restaurant");
            }
            
            // Verify menu item is available
            if (!menuItem.isAvailable()) {
                throw new BadRequestException("Menu item is currently unavailable: " + menuItem.getName());
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setName(menuItem.getName());
            orderItem.setPrice(menuItem.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());
            
            order.addOrderItem(orderItem);
        }
        
        // Calculate order total
        order.calculateTotal();
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Send notification in a separate thread
        notificationExecutor.submit(() -> {
            // Simulate sending notification to restaurant
            System.out.println("Sending notification to restaurant for Order #" + savedOrder.getId());
            
            // In a real implementation, this would use a messaging system like Kafka, RabbitMQ, or WebSockets
        });
        
        // Return response
        return convertToOrderResponse(savedOrder);
    }
    
    public List<OrderResponse> getUserOrders(Long userId, OrderStatus status) {
        List<Order> orders;
        
        if (status != null) {
            orders = orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        } else {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }
    
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        return convertToOrderResponse(order);
    }
    
    @Transactional
    public boolean cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        // Can only cancel if order is in PENDING or ACCEPTED state
        if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.ACCEPTED) {
            order.setStatus(OrderStatus.CANCELLED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            
            // Send cancellation notification asynchronously
            notificationExecutor.submit(() -> {
                System.out.println("Sending cancellation notification for Order #" + order.getId());
            });
            
            return true;
        }
        
        return false;
    }
    
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Long userId, OrderStatus newStatus) {
        // Here we would check if the user is a restaurant staff or delivery personnel 
        // and if they have permission to update this order's status
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        // Update the status
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        
        Order updatedOrder = orderRepository.save(order);
        
        // Send notification asynchronously
        notificationExecutor.submit(() -> {
            System.out.println("Sending status update notification for Order #" + orderId + " - New status: " + newStatus);
            
            // In a real app, send notifications to the appropriate users (customer, delivery personnel, etc.)
        });
        
        return convertToOrderResponse(updatedOrder);
    }
    
    // Helper method to convert Order to OrderResponse
    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setRestaurantId(order.getRestaurant().getId());
        response.setRestaurantName(order.getRestaurant().getName());
        response.setStatus(order.getStatus());
        response.setSubtotal(order.getSubtotal());
        response.setDeliveryFee(order.getDeliveryFee());
        response.setTax(order.getTax());
        response.setTotal(order.getTotal());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setSpecialInstructions(order.getSpecialInstructions());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setCompletedAt(order.getCompletedAt());
        response.setIsPaid(order.getIsPaid());
        
        // Convert order items
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemResponse itemResponse = new OrderItemResponse();
                    itemResponse.setId(item.getId());
                    itemResponse.setMenuItemId(item.getMenuItem().getId());
                    itemResponse.setName(item.getName());
                    itemResponse.setPrice(item.getPrice());
                    itemResponse.setQuantity(item.getQuantity());
                    itemResponse.setSpecialInstructions(item.getSpecialInstructions());
                    return itemResponse;
                })
                .collect(Collectors.toList());
        
        response.setOrderItems(itemResponses);
        
        return response;
    }
}
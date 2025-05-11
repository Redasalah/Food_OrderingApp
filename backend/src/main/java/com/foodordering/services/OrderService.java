// backend/src/main/java/com/foodordering/services/OrderService.java
package com.foodordering.services;

import com.foodordering.dtos.requests.OrderRequest;
import com.foodordering.dtos.responses.OrderResponse;
import com.foodordering.exceptions.ResourceNotFoundException;
import com.foodordering.models.*;
import com.foodordering.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public OrderResponse createOrder(String email, OrderRequest orderRequest) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Find restaurant
        Restaurant restaurant = restaurantRepository.findById(orderRequest.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        
        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        order.setSpecialInstructions(orderRequest.getSpecialInstructions());
        
        // Set payment method
        try {
            order.setPaymentMethod(PaymentMethod.valueOf(orderRequest.getPaymentMethod()));
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid payment method");
        }
        
        // Prepare order items (without calculating subtotal inside the stream)
        List<OrderItem> orderItems = orderRequest.getOrderItems().stream()
        .map(itemRequest -> {
            // Find menu item
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
            
            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            
            // Set the name field from the menu item name
            orderItem.setName(menuItem.getName());
            
            // Calculate item price
            BigDecimal itemPrice = menuItem.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            orderItem.setPrice(itemPrice);
            
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());
            orderItem.setOrder(order);
            
            return orderItem;
        })
        .collect(Collectors.toList());

        // Calculate subtotal after collecting all items
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItem item : orderItems) {
            subtotal = subtotal.add(item.getPrice());
        }
        
        // Set order items
        order.setOrderItems(orderItems);
        order.setSubtotal(subtotal);
        
        // Set financial details
        BigDecimal deliveryFee = restaurant.getDeliveryFee();
        BigDecimal taxRate = new BigDecimal("0.08"); // 8% tax
        BigDecimal tax = subtotal.multiply(taxRate);
        BigDecimal total = subtotal.add(deliveryFee).add(tax);
        
        order.setDeliveryFee(deliveryFee);
        order.setTax(tax);
        order.setTotal(total);
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Convert to response
        return convertToOrderResponse(savedOrder);
    }
    
    // Fetch user's orders
    public List<OrderResponse> getUserOrders(String email) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Fetch user's orders
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        
        // Convert to response DTOs
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }
    
    // Fetch user's orders by status
    public List<OrderResponse> getUserOrdersByStatus(String email, OrderStatus status) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Fetch user's orders by status
        List<Order> orders = orderRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status);
        
        // Convert to response DTOs
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }
    
    // Get specific order by ID
    public OrderResponse getOrderById(String email, Long orderId) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Find order
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Convert to response DTO
        return convertToOrderResponse(order);
    }
    
    // Cancel an order
    @Transactional
    public OrderResponse cancelOrder(String email, Long orderId) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Find order
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Check if order can be cancelled
        if (order.getStatus() != OrderStatus.PENDING && 
            order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order cannot be cancelled at this stage");
        }
        
        // Update order status
        order.setStatus(OrderStatus.CANCELLED);
        
        // Save updated order
        Order cancelledOrder = orderRepository.save(order);
        
        // Convert to response DTO
        return convertToOrderResponse(cancelledOrder);
    }
    
    // Helper method to convert Order to OrderResponse
    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setUserName(order.getUser().getName());
        response.setRestaurantId(order.getRestaurant().getId());
        response.setRestaurantName(order.getRestaurant().getName());
        
        // Convert order items
        List<OrderResponse.OrderItemResponse> orderItemResponses = order.getOrderItems().stream()
                .map(item -> {
                    OrderResponse.OrderItemResponse itemResponse = 
                        new OrderResponse.OrderItemResponse();
                    itemResponse.setId(item.getId());
                    itemResponse.setMenuItemId(item.getMenuItem().getId());
                    itemResponse.setMenuItemName(item.getMenuItem().getName());
                    itemResponse.setQuantity(item.getQuantity());
                    itemResponse.setPrice(item.getPrice());
                    itemResponse.setSpecialInstructions(item.getSpecialInstructions());
                    return itemResponse;
                })
                .collect(Collectors.toList());
        
        response.setOrderItems(orderItemResponses);
        response.setSubtotal(order.getSubtotal());
        response.setDeliveryFee(order.getDeliveryFee());
        response.setTax(order.getTax());
        response.setTotal(order.getTotal());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setSpecialInstructions(order.getSpecialInstructions());
        response.setStatus(order.getStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setCreatedAt(order.getCreatedAt());
        
        return response;
    }
}
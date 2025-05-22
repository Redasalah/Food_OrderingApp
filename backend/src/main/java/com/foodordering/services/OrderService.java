// backend/src/main/java/com/foodordering/services/OrderService.java
package com.foodordering.services;

import com.foodordering.dtos.requests.OrderRequest;
import com.foodordering.dtos.responses.OrderResponse;
import com.foodordering.exceptions.ResourceNotFoundException;
import com.foodordering.models.*;
import com.foodordering.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
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
        order.setPhoneNumber(orderRequest.getPhoneNumber());

        order.setStatus(OrderStatus.PENDING); // Explicitly set status to PENDING
        
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
    
    // Method to get orders by status for a specific restaurant
    public List<OrderResponse> getRestaurantOrdersByStatus(String email, Long restaurantId, OrderStatus status) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Find restaurant
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        
        // Find restaurants owned by this user to check permissions
        List<Restaurant> userRestaurants = restaurantRepository.findByOwnerId(user.getId());
        
        // Log restaurant details
        System.out.println("Restaurants owned by user: " + userRestaurants.size());
        userRestaurants.forEach(r -> 
            System.out.println("Restaurant: ID=" + r.getId() + ", Name=" + r.getName())
        );
        
        // Check if the requested restaurant belongs to the user
        boolean isOwner = userRestaurants.stream()
            .anyMatch(r -> r.getId().equals(restaurantId));
            
        if (!isOwner && user.getRole() == Role.RESTAURANT_STAFF) {
            System.out.println("No restaurant found with ID " + restaurantId + " for user " + user.getName());
            throw new ResourceNotFoundException("Restaurant not found or you don't have permission to view this restaurant's orders");
        }
        
        // Fetch orders
        List<Order> orders;
        if (status != null) {
            orders = orderRepository.findByRestaurantIdAndStatusOrderByCreatedAtDesc(restaurantId, status);
        } else {
            orders = orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        }
        
        // Log order details
        System.out.println("Found " + orders.size() + " orders for restaurant ID " + restaurantId);
        
        // Convert to DTOs
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }
    
    // Update order status
    @Transactional
    public OrderResponse updateOrderStatus(String email, Long orderId, OrderStatus newStatus) {
        // Find user who is updating the status
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Find the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Determine the current user's role
        Role userRole = user.getRole();
        OrderStatus currentStatus = order.getStatus();
        
        // Validation logic for status transitions
        switch (userRole) {
            case RESTAURANT_STAFF:
                // Check if the restaurant staff owns this restaurant
                if (!order.getRestaurant().getOwner().getId().equals(user.getId())) {
                    throw new IllegalStateException("You are not authorized to modify this order");
                }
                
                // Restaurant staff can move from PENDING to CONFIRMED, or CONFIRMED to READY_FOR_PICKUP
                if (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.CONFIRMED) {
                    order.setStatus(newStatus);
                } else if (currentStatus == OrderStatus.CONFIRMED && newStatus == OrderStatus.READY_FOR_PICKUP) {
                    order.setStatus(newStatus);
                } else {
                    throw new IllegalStateException("Invalid status transition for restaurant staff");
                }
                break;
            
            case DELIVERY_PERSONNEL:
                // Delivery personnel can move from READY_FOR_PICKUP to OUT_FOR_DELIVERY, 
                // or OUT_FOR_DELIVERY to DELIVERED
                if (currentStatus == OrderStatus.READY_FOR_PICKUP && newStatus == OrderStatus.OUT_FOR_DELIVERY) {
                    order.setStatus(newStatus);
                    // If order is being picked up, assign to this delivery user
                    order.setDeliveryUser(user);
                } else if (currentStatus == OrderStatus.OUT_FOR_DELIVERY && newStatus == OrderStatus.DELIVERED) {
                    // Check if this delivery person is assigned to this order
                    if (order.getDeliveryUser() == null || !order.getDeliveryUser().getId().equals(user.getId())) {
                        throw new IllegalStateException("You are not authorized to mark this order as delivered");
                    }
                    order.setStatus(newStatus);
                } else {
                    throw new IllegalStateException("Invalid status transition for delivery personnel");
                }
                break;
            
            case CUSTOMER:
                // Customers can only cancel PENDING or CONFIRMED orders
                if ((currentStatus == OrderStatus.PENDING || currentStatus == OrderStatus.CONFIRMED) 
                    && newStatus == OrderStatus.CANCELLED) {
                    order.setStatus(newStatus);
                } else {
                    throw new IllegalStateException("You cannot cancel this order at this stage");
                }
                break;
            
            default:
                throw new IllegalStateException("Unauthorized to modify order status");
        }
        
        // Save and return updated order
        Order updatedOrder = orderRepository.save(order);
        return convertToOrderResponse(updatedOrder);
    }
    
    // Additional method to help restaurant staff move orders through initial stages
    @Transactional
    public OrderResponse processInitialOrderStages(String email, Long orderId, OrderStatus newStatus) {
        // Find user (restaurant staff)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Find the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Validate that the user is restaurant staff and owns the restaurant
        if (user.getRole() != Role.RESTAURANT_STAFF || 
            !order.getRestaurant().getOwner().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to process this order");
        }
        
        // Initial order stages progression
        OrderStatus currentStatus = order.getStatus();
        
        if (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.CONFIRMED) {
            order.setStatus(newStatus);
        } else if (currentStatus == OrderStatus.CONFIRMED && newStatus == OrderStatus.READY_FOR_PICKUP) {
            order.setStatus(newStatus);
        } else {
            throw new IllegalStateException("Invalid order status progression");
        }
        
        // Save and return updated order
        Order updatedOrder = orderRepository.save(order);
        return convertToOrderResponse(updatedOrder);
    }
    
    // Get all orders by status (for delivery personnel to see available orders)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }
    
    // Get order details for delivery personnel
    @Transactional(readOnly = true)
    public OrderResponse getDeliveryOrderById(String email, Long orderId) {
        try {
            // Find delivery personnel
            User deliveryUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Delivery user not found"));
            
            // Find order
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
            
            // For delivery personnel, we need to be more flexible:
            // Allow access to:
            // - Orders in READY_FOR_PICKUP status (can be claimed by any delivery person)
            // - Orders in OUT_FOR_DELIVERY or DELIVERED status assigned to this delivery person
            
            boolean isAdmin = deliveryUser.getRole() == Role.ADMIN;
            boolean isDeliveryPersonnel = deliveryUser.getRole() == Role.DELIVERY_PERSONNEL;
            
            if (isAdmin) {
                // Admin can access any order
                return convertToOrderResponse(order);
            } else if (isDeliveryPersonnel) {
                // Check order status
                boolean isReadyForPickup = OrderStatus.READY_FOR_PICKUP.equals(order.getStatus());
                
                // Check if this delivery person is assigned to this order
                boolean isAssignedToThisUser = (order.getDeliveryUser() != null && 
                                              order.getDeliveryUser().getId().equals(deliveryUser.getId()));
                
                if (isReadyForPickup || isAssignedToThisUser) {
                    return convertToOrderResponse(order);
                }
                
                // If we reached here, the delivery person doesn't have access to this order
                throw new AccessDeniedException("You don't have permission to access this order");
            } else {
                // Not an admin or delivery personnel
                throw new AccessDeniedException("You don't have permission to access this order");
            }
        } catch (Exception e) {
            System.err.println("Error in getDeliveryOrderById: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to let the controller handle it
        }
    }
    
    // Assign an order to a delivery person
    @Transactional
    public OrderResponse assignOrderToDelivery(String email, Long orderId) {
        try {
            // Find delivery personnel
            User deliveryPersonnel = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Delivery personnel not found"));
            
            // Verify user is delivery personnel
            if (deliveryPersonnel.getRole() != Role.DELIVERY_PERSONNEL) {
                throw new IllegalStateException("Only delivery personnel can accept orders for delivery");
            }
            
            // Find the order
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            
            // Verify order is ready for pickup
            if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
                throw new IllegalStateException("Only orders that are ready for pickup can be accepted for delivery");
            }
            
            // Update order status to OUT_FOR_DELIVERY
            order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
            
            // Set the delivery user field
            order.setDeliveryUser(deliveryPersonnel);
            
            // Save updated order
            Order updatedOrder = orderRepository.save(order);
            
            // Log successful assignment
            System.out.println("Order " + orderId + " assigned to delivery user " + deliveryPersonnel.getName());
            
            return convertToOrderResponse(updatedOrder);
        } catch (Exception e) {
            System.err.println("Error assigning order to delivery: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    // Helper method to convert Order to OrderResponse
    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setUserName(order.getUser().getName());
        response.setRestaurantId(order.getRestaurant().getId());
        response.setRestaurantName(order.getRestaurant().getName());
        response.setPhoneNumber(order.getPhoneNumber());

        
        // Set delivery user information if available
        if (order.getDeliveryUser() != null) {
            response.setDeliveryUserId(order.getDeliveryUser().getId());
            response.setDeliveryUserName(order.getDeliveryUser().getName());
        }
        
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
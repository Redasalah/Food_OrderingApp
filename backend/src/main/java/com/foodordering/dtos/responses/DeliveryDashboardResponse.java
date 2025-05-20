// backend/src/main/java/com/foodordering/dtos/responses/DeliveryDashboardResponse.java
package com.foodordering.dtos.responses;

import java.math.BigDecimal;
import java.util.List;

public class DeliveryDashboardResponse {
    private OrderResponse activeDelivery;
    private int deliveredToday;
    private BigDecimal totalEarningsToday;
    private boolean isActive;
    private int availableOrders;
    private List<RecentDeliveryResponse> recentDeliveries;

    public static class RecentDeliveryResponse {
        private Long orderId;
        private String restaurantName;
        private String completedAt;
        private BigDecimal earnings;

        public RecentDeliveryResponse() {}

        public RecentDeliveryResponse(Long orderId, String restaurantName, String completedAt, BigDecimal earnings) {
            this.orderId = orderId;
            this.restaurantName = restaurantName;
            this.completedAt = completedAt;
            this.earnings = earnings;
        }

        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getRestaurantName() { return restaurantName; }
        public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
        public BigDecimal getEarnings() { return earnings; }
        public void setEarnings(BigDecimal earnings) { this.earnings = earnings; }
    }

    // Constructors, Getters, and Setters
    public DeliveryDashboardResponse() {}

    // Full getters and setters for all fields (omitted for brevity)
    public OrderResponse getActiveDelivery() { return activeDelivery; }
    public void setActiveDelivery(OrderResponse activeDelivery) { this.activeDelivery = activeDelivery; }
    public int getDeliveredToday() { return deliveredToday; }
    public void setDeliveredToday(int deliveredToday) { this.deliveredToday = deliveredToday; }
    public BigDecimal getTotalEarningsToday() { return totalEarningsToday; }
    public void setTotalEarningsToday(BigDecimal totalEarningsToday) { this.totalEarningsToday = totalEarningsToday; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public int getAvailableOrders() { return availableOrders; }
    public void setAvailableOrders(int availableOrders) { this.availableOrders = availableOrders; }
    public List<RecentDeliveryResponse> getRecentDeliveries() { return recentDeliveries; }
    public void setRecentDeliveries(List<RecentDeliveryResponse> recentDeliveries) { this.recentDeliveries = recentDeliveries; }
}
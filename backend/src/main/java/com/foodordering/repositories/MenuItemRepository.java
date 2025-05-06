// backend/src/main/java/com/foodordering/repositories/MenuItemRepository.java
package com.foodordering.repositories;

import com.foodordering.models.MenuItem;
import com.foodordering.models.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurant(Restaurant restaurant);
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByCategory(String category);
}
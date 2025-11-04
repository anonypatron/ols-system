package com.ols.repository;

import com.ols.entity.Cart;
import com.ols.entity.CartItem;
import com.ols.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    boolean existsByCartAndCourse(Cart cart, Course course);
    void deleteByCartAndCourseIn(Cart cart, List<Course> courses);
    void deleteAllByCourseIdIn(List<Long> courseIds);
}

package com.ols.service;

import com.ols.dto.request.CourseEnrollRequestDto;
import com.ols.dto.response.CourseResponseDto;
import com.ols.entity.*;
import com.ols.exception.NotFoundUsers;
import com.ols.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final CourseRepository courseRepository;
    private final UsersRepository usersRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

    public List<CourseResponseDto> findAll(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));
        Student student = studentRepository.findByUsers(user)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        Cart cart = student.getCart();

        List<CartItem> cartItems = cart.getCartItems();

        return cartItems.stream()
                .map(CartItem::getCourse)
                .map(CourseResponseDto::fromEntity)
                .toList();
    }

    public boolean save(Long userId, CourseEnrollRequestDto dto) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));
        Student student = studentRepository.findByUsers(user)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        Course course = courseRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));
        Cart cart = student.getCart();

        if (cartItemRepository.existsByCartAndCourse(cart, course)) {
            return false;
        }
        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            return false;
        }

        cartItemRepository.save(CartItem.builder()
                .cart(cart)
                .course(course)
                .build());
        return true;
    }

    @Transactional
    public boolean deleteAll(Long userId, List<Long> courseIds) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));
        Student student = studentRepository.findByUsers(user)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        List<Course> courses = courseRepository.findAllById(courseIds);
        Cart cart = student.getCart();

        if (courses.isEmpty()) {
            return false;
        }

        cartItemRepository.deleteByCartAndCourseIn(cart, courses);
        return true;
    }

}

package com.ols.repository;

import com.ols.entity.Course;
import com.ols.entity.Review;
import com.ols.entity.Student;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @NotNull
    Page<Review> findAllByCourseId(Long courseId, @NotNull Pageable pageable);

    Optional<Review> findByStudentAndCourse(Student student, Course course);
}

package com.ols.repository;

import com.ols.entity.Course;
import com.ols.entity.Enrollment;
import com.ols.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByStudentAndCourse(Student student, Course course);
}

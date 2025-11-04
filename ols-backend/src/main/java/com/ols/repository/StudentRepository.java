package com.ols.repository;

import com.ols.entity.Student;
import com.ols.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUsers(Users user);
}

package com.ols.repository;

import com.ols.entity.Teacher;
import com.ols.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUsers(Users user);
}

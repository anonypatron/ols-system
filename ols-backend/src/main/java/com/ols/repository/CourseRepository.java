package com.ols.repository;

import com.ols.common.CourseStatus;
import com.ols.common.Tag;
import com.ols.entity.Course;
import com.ols.entity.Teacher;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacher(Teacher teacher);
    List<Course> findByStatus(CourseStatus status);

    @Query("SELECT c FROM Course c JOIN c.tags ct WHERE ct.tag IN :tags GROUP BY c")
    List<Course> findByTagsIn(List<Tag> tags);

    @NonNull
    Page<Course> findAllByStatus(@NonNull Pageable pageable, CourseStatus status);
}

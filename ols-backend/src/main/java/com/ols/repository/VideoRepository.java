package com.ols.repository;

import com.ols.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoRepository extends JpaRepository<Video,Long> {
    List<Video> findByCourseId(Long courseId);
    boolean existsByCourse_IdIn(List<Long> courseIds);
}

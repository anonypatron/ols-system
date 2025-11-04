package com.ols.dto.response;

import com.ols.common.CourseStatus;
import com.ols.entity.Course;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class CourseResponseDto {

    private Long courseId;
    private String courseName;
    private String description;
    private String teacherName;
    private CourseStatus courseStatus;
    private Double rating;
    private Long reviewCount;
    private Long price;
    private List<CourseTagResponseDto> tags;
    private String imagePath;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder
    public CourseResponseDto(
            Long courseId,
            String courseName,
            String description,
            String teacherName,
            CourseStatus courseStatus,
            Double rating,
            Long reviewCount,
            Long price,
            List<CourseTagResponseDto> tags,
            String imagePath,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.description = description;
        this.teacherName = teacherName;
        this.courseStatus = courseStatus;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.price = price;
        this.tags = tags;
        this.imagePath = imagePath;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static CourseResponseDto fromEntity(Course course) {
        return CourseResponseDto.builder()
                .courseId(course.getId())
                .courseName(course.getCourseName())
                .description(course.getDescription())
                .teacherName(course.getTeacher().getUsers().getUsername())
                .courseStatus(course.getStatus())
                .rating(course.getRating())
                .reviewCount(course.getReviewCount())
                .price(course.getPrice())
                .tags(course.getTags().stream()
                        .map(CourseTagResponseDto::fromEntity)
                        .collect(Collectors.toList()))
                .imagePath(course.getImagePath())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

}

package com.ols.dto.response;

import com.ols.entity.Review;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewResponseDto {

    private Long id;
    private String courseName;
    private String author;
    private String title;
    private String content;
    private Double rating;
    private LocalDateTime createdAt;

    @Builder
    public ReviewResponseDto(
            Long id,
            String courseName,
            String author,
            String title,
            String content,
            Double rating,
            LocalDateTime createdAt) {
        this.id = id;
        this.courseName = courseName;
        this.author = author;
        this.title = title;
        this.content = content;
        this.rating = rating;
        this.createdAt = createdAt;
    }

    public static ReviewResponseDto fromEntity(Review review) {
        return ReviewResponseDto.builder()
                .id(review.getId())
                .courseName(review.getCourse().getCourseName())
                .author(review.getStudent().getUsers().getUsername())
                .title(review.getTitle())
                .content(review.getContent())
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .build();
    }

}

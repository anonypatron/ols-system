package com.ols.entity;

import com.ols.common.CourseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Getter
@Setter
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String courseName; // 과목 이름

    @Column(columnDefinition = "TEXT")
    private String description; // 상세 정보

    @Column
    private Double rating;

    @Column
    private Long reviewCount;

    @Column
    private Double totalRatingSum;

    @Column
    private Long price;

    @Column
    private String imagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseStatus status; // 과목 상태: PENDING, APPROVED, REJECTED

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Video> videos = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseTag> tags = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Review> reviews = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder
    public Course(String courseName,
                  String description,
                  Teacher teacher,
                  CourseStatus status,
                  Double rating,
                  Long reviewCount,
                  Double totalRatingSum,
                  Long price,
                  String imagePath) {
        this.courseName = courseName;
        this.description = description;
        this.teacher = teacher;
        this.status = status;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.totalRatingSum = totalRatingSum;
        this.price = price;
        this.imagePath = imagePath;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addEnrollment(Enrollment enrollment) {
        enrollments.add(enrollment);
        enrollment.setCourse(this);
    }

    public void addTag(CourseTag courseTag) {
        tags.add(courseTag);
        courseTag.setCourse(this);
    }

    public void updateTags(List<CourseTag> courseTags) {
        tags.clear();
        tags.addAll(courseTags);
    }

}

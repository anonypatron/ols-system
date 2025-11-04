package com.ols.entity;


import com.ols.common.VideoStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Getter
@Setter
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String videoTitle;

    @Column(nullable = false)
    private String description;

    @Column
    private String filePath;

    @Column
    private String thumbnailPath;

    @Enumerated(EnumType.STRING)
    private VideoStatus videoStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private LocalDateTime uploadedAt;

    @Builder
    public Video(String videoTitle,
                 String description,
                 String filePath,
                 String thumbnailPath,
                 Course course,
                 VideoStatus videoStatus) {
        this.videoTitle = videoTitle;
        this.description = description;
        this.filePath = filePath;
        this.thumbnailPath = thumbnailPath;
        this.course = course;
        this.videoStatus = videoStatus;
    }

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }

}

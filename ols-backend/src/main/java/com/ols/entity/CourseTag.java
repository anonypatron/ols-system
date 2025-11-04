package com.ols.entity;

import com.ols.common.Tag;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@IdClass(CourseTagId.class)
@Getter
@Setter
public class CourseTag {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "tag")
    private Tag tag;

    @Builder
    public CourseTag(Course course, Tag tag) {
        this.course = course;
        this.tag = tag;
    }

}

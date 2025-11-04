package com.ols.entity;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "enrollment")
@Entity
@Getter
@Setter
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Builder
    public Enrollment(Course course, Student student) {
        this.course = course;
        this.student = student;
    }

    public static Enrollment createEnrollment(Student student, Course course) {
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();

        student.addEnrollment(enrollment);
        course.addEnrollment(enrollment);

        return enrollment;
    }

}

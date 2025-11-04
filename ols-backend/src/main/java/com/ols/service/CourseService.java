package com.ols.service;

import com.ols.common.CourseStatus;
import com.ols.common.Role;
import com.ols.common.Tag;
import com.ols.dto.request.CourseRegisterRequestDto;
import com.ols.dto.request.CourseUpdateRequestDto;
import com.ols.dto.request.UpdateCourseRequestDto;
import com.ols.dto.response.CourseResponseDto;
import com.ols.dto.response.CourseTagResponseDto;
import com.ols.entity.*;
import com.ols.exception.NotFoundUsers;
import com.ols.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class CourseService {

    @Value("${image.upload.base-dir}")
    private String baseImageDir;

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final CartItemRepository cartItemRepository;
    private final UsersRepository usersRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final VideoRepository videoRepository;

    public List<CourseResponseDto> getCoursesByTags(String query) {
        List<Tag> tags = Arrays.stream(query.split(","))
                .map(Tag::valueOf)
                .collect(Collectors.toList());
        List<Course> courses = courseRepository.findByTagsIn(tags);

        return courses.stream()
                .map(CourseResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CourseTagResponseDto> getAllTags() {
        return Arrays.stream(Tag.values())
                .map(CourseTagResponseDto::new)
                .collect(Collectors.toList());
    }

    public boolean existsVideo(List<Long> courseIds) {
        return !videoRepository.existsByCourse_IdIn(courseIds);
    }

    public List<CourseResponseDto> findByUserId(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));
        List<Course> courses;

        if (user.getRole().equals(Role.TEACHER)) { // 선생일 경우 본인에 해당하는 과목 전체
            Teacher teacher = teacherRepository.findByUsers(user)
                    .orElseThrow(() -> new NotFoundUsers("teacher not found"));
            courses = courseRepository.findByTeacher(teacher);
        }
        else if (user.getRole().equals(Role.STUDENT)) { // 학생일 경우 본인에 해당하는 과목 + APPROVED된 강의
            Student student = studentRepository.findByUsers(user)
                    .orElseThrow(() -> new NotFoundUsers("student not found"));
            courses = student.getCourses();
        }
        else { // 관리자일 경우 모든 과목
            courses = courseRepository.findAll();
        }

        return courses.stream()
                .map((course) -> {
                    Teacher teacher = course.getTeacher();

                    Users tmp_user = usersRepository.findByTeacherId(teacher.getId())
                            .orElseThrow(() -> new NotFoundUsers("teacher not found"));

                    return CourseResponseDto.fromEntity(course);
                })
                .collect(Collectors.toList());
    }

    public List<CourseResponseDto> findByStatus(CourseStatus status) {
        List<Course> courses = courseRepository.findByStatus(status);

        return courses.stream()
                .map((course) -> {
                    Long teacherId = course.getTeacher().getId();

                    Users user = usersRepository.findByTeacherId(teacherId)
                            .orElseThrow(() -> new NotFoundUsers("user not found"));

                    return CourseResponseDto.fromEntity(course);
                })
                .collect(Collectors.toList());
    }

    @Deprecated
    public List<CourseResponseDto> findAll() {
        List<Course> courses = courseRepository.findAll();

        return courses.stream()
                .map(CourseResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<CourseResponseDto> getCourses(CourseStatus status, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Course> courses = courseRepository.findAllByStatus(pageable, status);

        return courses.map(CourseResponseDto::fromEntity);
    }

    @Transactional
    public Course save(Long userId, CourseRegisterRequestDto dto, MultipartFile image) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));
        Teacher teacher = teacherRepository.findByUsers(user)
                .orElseThrow(() -> new NotFoundUsers("teacher not found"));

        Course course = Course.builder()
                .courseName(dto.getCourseName())
                .description(dto.getDescription())
                .teacher(teacher)
                .status(CourseStatus.PENDING)
                .rating(0.0)
                .totalRatingSum(0.0)
                .reviewCount(0L)
                .price(dto.getPrice())
                .build();

        dto.getTags().stream()
                .map(Tag::valueOf)
                .forEach(tag -> {
                    course.addTag(CourseTag.builder()
                            .course(course)
                            .tag(tag)
                            .build());
                });

        Course savedCourse = courseRepository.save(course);

        String originalFilename = image.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String imageName = savedCourse.getId() + fileExtension; // 1.jpg
        Path imageFilePath = Paths.get(baseImageDir, imageName);

        try {
            image.transferTo(imageFilePath);
        } catch (IOException e) {
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }

        savedCourse.setImagePath("/images/" + imageName);
        return courseRepository.save(savedCourse);
    }

    @Transactional
    public Course update(Long userId, CourseUpdateRequestDto dto, MultipartFile image) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));
        Course course = courseRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("course not found"));

        course.setCourseName(dto.getCourseName());
        course.setDescription(dto.getDescription());
        course.setPrice(dto.getPrice());
        course.updateTags(dto.getTags().stream()
                .map(Tag::valueOf)
                .map(tag -> CourseTag.builder()
                        .course(course)
                        .tag(tag)
                        .build())
                .collect(Collectors.toList()));

        // 1. 기존 파일 제거
        if (image != null && !image.isEmpty()) {
            String existingImageName = course.getImagePath();
            if (existingImageName != null && !existingImageName.isEmpty()) {
                try {
                    Path existingFilePath = Paths.get(baseImageDir, existingImageName.replace("/images/", ""));
                    if (Files.exists(existingFilePath)) {
                        Files.delete(existingFilePath);
                    }
                } catch (IOException e) {
                    System.out.println("기존 파일 삭제 실패");
                }
            }
        }

        // 2. 파일 저장
        String originalFilename = image.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String imageName = course.getId() + fileExtension;
        Path imageFilePath = Paths.get(baseImageDir, imageName);

        try {
            image.transferTo(imageFilePath);
            course.setImagePath("/images/" + imageName);
        } catch (IOException e) {
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }

        return courseRepository.save(course);
    }

    @Transactional
    public void updateCourseStatus(UpdateCourseRequestDto dto) {
        Long courseId = dto.getCourseId();
        CourseStatus status = dto.getStatus();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("course Not found"));

        course.setStatus(status);
    }

    @Transactional
    public boolean deleteCourse(List<Long> courseIds) {
        List<Course> coursesToDelete = courseRepository.findAllById(courseIds);

        if (coursesToDelete.isEmpty()) {
            return false;
        }

        cartItemRepository.deleteAllByCourseIdIn(courseIds);

        for (Course course : coursesToDelete) {
            String imagePath = course.getImagePath();
            if (imagePath != null && !imagePath.isEmpty()) {
                try {
                    String fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
                    Path filePath = Paths.get(baseImageDir, fileName);
                    Files.deleteIfExists(filePath);
                    System.out.println("Success to delete filePath: " + filePath);
                } catch (IOException e) {
                    System.out.println("Failed to delete image file: " + imagePath);
                    throw new RuntimeException("Failed to delete image file: " + imagePath, e);
                }
            }
        }
        courseRepository.deleteAllById(courseIds);

        return true;
    }

    public void enrollCourse(Student student, List<Long> courseIds) {
        List<Course> courses = courseRepository.findAllById(courseIds);
        List<Enrollment> enrollments = new ArrayList<>();

        for (Course course : courses) {
            Enrollment enrollment = Enrollment.createEnrollment(student, course);
            enrollments.add(enrollment);
        }
        enrollmentRepository.saveAll(enrollments);
    }

}

package com.ols.controller;

import com.ols.common.CourseStatus;
import com.ols.dto.request.CourseRegisterRequestDto;
import com.ols.dto.request.CourseUpdateRequestDto;
import com.ols.dto.request.UpdateCourseRequestDto;
import com.ols.dto.response.CourseResponseDto;
import com.ols.dto.response.CourseTagResponseDto;
import com.ols.entity.Course;
import com.ols.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/courses")
public class CourseApiController {

    private final CourseService courseService;

    // 태그얻기
    @GetMapping("/tags")
    public ResponseEntity<List<CourseTagResponseDto>> viewTags(){
        return ResponseEntity.ok(courseService.getAllTags());
    }

    // 사용자 역할에 따른 과목 리턴
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CourseResponseDto>> viewCourses(
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(courseService.findByUserId(userId));
    }

    // 상태에 따른 과목 보기
    @GetMapping("/status")
    public ResponseEntity<List<CourseResponseDto>> viewCourses(
            @RequestParam(required = false) CourseStatus status
    ) {
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(courseService.findByStatus(status));
    }

    @GetMapping
    public ResponseEntity<Page<CourseResponseDto>> getCourses(
            @RequestParam(defaultValue = "") CourseStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(courseService.getCourses(status, page, size));
    }

    /**
     * 예시 url
     * https://localhost/api/search?q=BUSINESS,MARKETING,SELF_DEVELOPMENT,DESIGN
     */
    @GetMapping("/search")
    public ResponseEntity<List<CourseResponseDto>> searchCourses(
            @RequestParam("q") String query
    ) {
        return ResponseEntity.ok(courseService.getCoursesByTags(query));
    }

    // 선생이 강의를 등록
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Course> registerCourse(
            @AuthenticationPrincipal Long userId,
            @ModelAttribute CourseRegisterRequestDto dto,
            @RequestParam("image") MultipartFile image
    ) {
        return ResponseEntity.ok(courseService.save(userId, dto, image));
    }

    // 과목 상태 업데이트 (PENDING, APPROVED, REJECTED)
    @PatchMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateCourseStatus(
            @RequestBody UpdateCourseRequestDto dto
    ) {
        courseService.updateCourseStatus(dto);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Course> updateCourse(
            @AuthenticationPrincipal Long userId,
            @ModelAttribute CourseUpdateRequestDto dto,
            @RequestParam("image") MultipartFile image
    ) {
        System.out.println("call patch");
        return ResponseEntity.ok(courseService.update(userId, dto, image));
    }

    // 과목 삭제
    @PostMapping("/delete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteCourse(
            @RequestBody List<Long> courseIds
    ) {
        if (courseService.existsVideo(courseIds) && courseService.deleteCourse(courseIds)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

}

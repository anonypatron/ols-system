package com.ols.controller;

import com.ols.dto.request.ReviewUploadRequestDto;
import com.ols.dto.response.ReviewResponseDto;
import com.ols.entity.Users;
import com.ols.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<Page<ReviewResponseDto>> getReviews(
            @RequestParam Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return ResponseEntity.ok(reviewService.getReviews(courseId, page, size));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> uploadReviews(
            @AuthenticationPrincipal Long userId,
            @RequestParam Long courseId,
            @RequestBody ReviewUploadRequestDto dto
    ) {
        if (reviewService.save(userId, courseId, dto)) {
            return ResponseEntity.status(HttpStatus.CREATED).build();
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

}

package com.ols.controller;

import com.ols.dto.request.PrepareCashItemListRequestDto;
import com.ols.dto.request.CourseEnrollRequestDto;
import com.ols.dto.response.CourseResponseDto;
import com.ols.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    // 카트 보기
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CourseResponseDto>> viewCart( // 조회
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(cartService.findAll(userId));
    }

    // 카트에 담기
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> addToCart(
            @AuthenticationPrincipal Long userId,
            @RequestBody CourseEnrollRequestDto dto
    ) {
        if (cartService.save(userId, dto)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    // 카트에서 제거
    @PostMapping("/delete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteCart(
            @AuthenticationPrincipal Long userId,
            @RequestBody PrepareCashItemListRequestDto dto
    ) {
        if (cartService.deleteAll(userId, dto.getCourseIds())) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

}

package com.ols.controller;

import com.ols.dto.request.UserUpdateRequestDto;
import com.ols.dto.response.UserInfoResponseDto;
import com.ols.entity.Users;
import com.ols.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserApiController {

    private final UserService userService;

    @GetMapping("/info")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserInfoResponseDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getPrincipal();

        return ResponseEntity.ok(userService.getCurrentUserInfo(userId));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteCurrentUser(
            @AuthenticationPrincipal Long userId
    ) {
        boolean status = userService.deleteUser(userId);
        if (status) {
            return ResponseEntity.noContent().build();
        }
        else {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateCurrentUser(
            @AuthenticationPrincipal Long userId,
            @RequestBody UserUpdateRequestDto dto
            ) {
        boolean status = userService.updateUser(userId, dto);

        if (status) {
            return ResponseEntity.noContent().build();
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
        }
    }

}

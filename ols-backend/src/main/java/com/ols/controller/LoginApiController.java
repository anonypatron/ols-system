package com.ols.controller;

import com.ols.common.Role;
import com.ols.config.jwt.JwtProperties;
import com.ols.config.jwt.TokenProvider;
import com.ols.dto.request.UserLoginRequestDto;
import com.ols.dto.request.UserSignupRequestDto;
import com.ols.entity.RefreshToken;
import com.ols.entity.Users;
import com.ols.service.AdminService;
import com.ols.service.StudentService;
import com.ols.service.TeacherService;
import com.ols.service.UserService;
import com.ols.service.jwt.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class LoginApiController {

    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final JwtProperties jwtProperties;
    private final TokenProvider tokenProvider;

    private final UserService userService;
    private final TeacherService teacherService;
    private final StudentService studentService;
    private final AdminService adminService;

    @PostMapping("/signup")
    public ResponseEntity<Users> signup(
            @RequestBody UserSignupRequestDto requestDto
    ) {
        try {
            Users user = userService.save(requestDto);

            switch (requestDto.getRole()) {
                case Role.TEACHER:
                    teacherService.save(user);
                    break;
                case Role.STUDENT:
                    studentService.save(user);
                    break;
                case Role.ADMIN:
                    adminService.save(user);
                    break;
            }

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody UserLoginRequestDto requestDto,
            HttpServletResponse response
    ) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Users users = (Users) authentication.getPrincipal();

            String accessToken = tokenProvider.generateAccessToken(users);
            String refreshToken = tokenProvider.generateRefreshToken(users);

            refreshTokenService.saveOrUpdateRefreshToken(users.getId(), refreshToken, Duration.ofDays(7));
            // HttpOnly 쿠키에 access Token 저장
            ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(jwtProperties.getAccessTokenExpirationMs())
                    .secure(true)
                    .sameSite("Strict")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

            // HttpOnly 쿠키에 Refresh Token 저장 (ResponseCookie 사용)
            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(jwtProperties.getRefreshTokenExpirationMs())
                    .secure(true)
                    .sameSite("Strict")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

            return ResponseEntity.ok().build();
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false)
            String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token not found in cookie.");
        }

        // 1. JWT 토큰 유효성 검사 (서명, 만료 여부)
        if (!tokenProvider.validToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token.");
        }

        // 2. DB에 저장된 Refresh Token과 일치하는지 확인
        RefreshToken storedRefreshToken = refreshTokenService.findByRefreshToken(refreshToken);
        if (storedRefreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token not found in DB.");
        }

        // 3. Refresh Token의 만료 시간 확인 (DB 기준)
        if (storedRefreshToken.getExpiryDate().isBefore(Instant.now())) {
            // DB의 Refresh Token도 만료되었다면 삭제하고 UNATHORIZED
            refreshTokenService.deleteRefreshToken(storedRefreshToken.getUsersId()); // 만료된 토큰 삭제
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired refresh token in DB. Please re-login.");
        }

        // 4. 새로운 Access Token 및 Refresh Token 발급 (Refresh Token Rotation)
        Users users = userService.findById(storedRefreshToken.getUsersId());
        String newAccessToken = tokenProvider.generateAccessToken(users);
        String newRefreshToken = tokenProvider.generateRefreshToken(users);

        // 5. DB의 Refresh Token 업데이트 (기존 토큰 무효화)
        refreshTokenService.updateRefreshToken(users.getId(), newRefreshToken, Duration.ofDays(7));

        // 6. 새로운 토큰들을 HTTP Only 쿠키로 전송
        ResponseCookie newAccessTokenCookie = ResponseCookie.from("accessToken", newAccessToken)
                .httpOnly(true)
                .path("/")
                .maxAge(jwtProperties.getAccessTokenExpirationMs())
                .secure(false)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, newAccessTokenCookie.toString());

        ResponseCookie newRefreshTokenCookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(jwtProperties.getRefreshTokenExpirationMs())
                .secure(false)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, newRefreshTokenCookie.toString());

        return ResponseEntity.ok().build(); // 응답 바디 없이 성공 반환
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logoutUser(
            HttpServletResponse response,
            @CookieValue(name = "refreshToken", required = false)
            String refreshToken
    ) {
        if (refreshToken != null) {
            // Refresh Token을 DB에서 삭제하여 무효화
            try {
                // JWT에서 userId 추출 (RefreshToken 유효성 검사 필요)
                Long userId = tokenProvider.getUserIdFromToken(refreshToken);
                refreshTokenService.deleteRefreshToken(userId);
            } catch (Exception e) {
                // 토큰이 유효하지 않거나 파싱할 수 없는 경우 처리
                System.err.println("Error processing refresh token during logout: " + e.getMessage());
            }
        }

        // 클라이언트 쿠키 무효화
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true).path("/").maxAge(0).secure(false).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).path("/").maxAge(0).secure(false).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        return ResponseEntity.ok().build();
    }

}

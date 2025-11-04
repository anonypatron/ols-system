package com.ols.service.jwt;

import com.ols.config.jwt.TokenProvider;
import com.ols.entity.Users;
import com.ols.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Deprecated
@RequiredArgsConstructor
//@Service
public class TokenService {

    private final TokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

    public String createNewAccessToken(String refreshToken) {
        // 토큰 유효성 검사에 실패하면 예외 발생
        if(!tokenProvider.validToken(refreshToken)) {
            throw new IllegalArgumentException("Unexpected token");
        }

        Long userId = refreshTokenService.findByRefreshToken(refreshToken).getUsersId();
        Users user = userService.findById(userId);

        return tokenProvider.generateAccessToken(user);
    }

}

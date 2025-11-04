package com.ols.config.jwt;

import com.ols.entity.Users;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Date;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class TokenProvider {

    private final JwtProperties jwtProperties;
    private SecretKey cachedSecretKey;

    // SecretKey를 한 번만 생성하도록 캐싱
    private SecretKey getSigningKey() {
        if (cachedSecretKey == null) {
            cachedSecretKey = Keys.hmacShaKeyFor(jwtProperties.getSecretKey().getBytes());
        }
        return cachedSecretKey;
    }

    public String generateAccessToken(Users users) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getAccessTokenExpirationMs());
        return makeToken(expiryDate, users);
    }

    public String generateRefreshToken(Users users) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getRefreshTokenExpirationMs());
        return makeToken(expiryDate, users);
    }

    private String makeToken(Date expiry, Users users) {
        Date now = new Date();

        return Jwts.builder()
                .header()
                .type("JWT")
                .and()
                .issuer(jwtProperties.getIssuer())
                .issuedAt(now)
                .expiration(expiry)
                .subject(users.getEmail())
                .claim("id", users.getId())
                .claim("username", users.getUsername())
                .claim("role", users.getRole().name())
                .signWith(getSigningKey())
                .compact(); // 직렬화
    }

    public boolean validToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) { // 토큰이 만료되었을 때
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (MalformedJwtException e) { // 유효하지 않은 JWT (형식 오류)
            System.err.println("Invalid JWT token: " + e.getMessage());
        } catch (UnsupportedJwtException e) { // 지원되지 않는 JWT 토큰
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) { // JWT 클레임 문자열이 비어있음
            System.err.println("JWT claims string is empty: " + e.getMessage());
        } catch (Exception e) { // 기타 모든 예외
            System.err.println("JWT validation error: " + e.getMessage());
        }
        return false;
    }

    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token);
        Long userId = claims.get("id", Long.class);
        String role = claims.get("role", String.class);

        if (userId == null) {
            throw new BadCredentialsException("Invalid token");
        }

        Set<SimpleGrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role));

        return new UsernamePasswordAuthenticationToken(userId, null, authorities);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserIdFromToken(String token) {
        return getClaims(token).get("id", Long.class);
    }

}

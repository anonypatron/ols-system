package com.ols.repository;

import com.ols.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByUsersId(Long userId);
    Optional<RefreshToken> findByRefreshToken(String refreshToken);
    void deleteByUsersId(Long userId);
}

package com.ols.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "users_id", nullable = false, unique = true)
    private Long usersId;

    @Column(name = "refresh_token", nullable = false, length = 1000)
    private String refreshToken;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @Builder
    public RefreshToken(Long usersId, String refreshToken, Instant expiryDate) {
        this.usersId = usersId;
        this.refreshToken = refreshToken;
        this.expiryDate = expiryDate;
    }

    public RefreshToken update(String newRefreshToken, Instant newExpiryDate) {
        this.refreshToken = newRefreshToken;
        this.expiryDate = newExpiryDate;
        return this;
    }

}

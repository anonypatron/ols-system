package com.ols.dto.response;

import com.ols.common.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserInfoResponseDto {

    private String username;
    private String email;
    private Role role;

    @Builder
    public UserInfoResponseDto(String username, String email, Role role) {
        this.username = username;
        this.email = email;
        this.role = role;
    }

}

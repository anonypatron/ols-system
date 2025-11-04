package com.ols.dto.request;

import com.ols.common.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSignupRequestDto {

    private String username;
    private String email;
    private String password;
    private Role role;

}

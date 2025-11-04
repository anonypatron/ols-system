package com.ols.service;

import com.ols.entity.Admin;
import com.ols.entity.Users;
import com.ols.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public Admin save(Users users) {
        return adminRepository.save(
                Admin.builder()
                        .users(users)
                        .build()
        );
    }

}

package com.ols.service;

import com.ols.common.Role;
import com.ols.dto.request.UserSignupRequestDto;
import com.ols.dto.request.UserUpdateRequestDto;
import com.ols.dto.response.UserInfoResponseDto;
import com.ols.entity.Course;
import com.ols.entity.Teacher;
import com.ols.entity.Users;
import com.ols.exception.NotFoundUsers;
import com.ols.repository.CourseRepository;
import com.ols.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final CourseRepository courseRepository;

    public UserInfoResponseDto getCurrentUserInfo(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("User not found"));
        if (user == null) {
            throw new NotFoundUsers("user not found");
        }

        return UserInfoResponseDto.builder()
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public boolean updateUser(Long userId, UserUpdateRequestDto dto) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("User not found"));
        if (user == null) {
            throw new NotFoundUsers("user not found");
        }

        user.setEmail(dto.getEmail());
        user.setPassword(bCryptPasswordEncoder.encode(dto.getPassword()));
        usersRepository.save(user);
        return true;
    }

    public Users save(UserSignupRequestDto dto) {
        return usersRepository.save(
                Users.builder()
                    .username(dto.getUsername())
                    .email(dto.getEmail())
                    .password(bCryptPasswordEncoder.encode(dto.getPassword()))
                    .role(dto.getRole())
                    .build()
        );
    }

    public Users findById(Long userId) {
        return usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Unexpected user"));
    }

    public Users findByEmail(String email) {
        return usersRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Unexpected user: email"));
    }

    public boolean deleteUser(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("User not found"));
        if (user == null) {
            throw new NotFoundUsers("User not found");
        }

        if (user.getRole().equals(Role.TEACHER)) {
            List<Course> courses = courseRepository.findByTeacher(user.getTeacher());
            if (!courses.isEmpty()) {
                return false;
            }
        }
        usersRepository.delete(user);
        return true;
    }

}

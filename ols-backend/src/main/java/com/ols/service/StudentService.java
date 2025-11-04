package com.ols.service;

import com.ols.entity.Student;
import com.ols.entity.Users;
import com.ols.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public Student save(Users users) {
        return studentRepository.save(
                Student.builder()
                        .users(users)
                        .build()
        );
    }

}

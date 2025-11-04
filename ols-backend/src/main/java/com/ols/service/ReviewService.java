package com.ols.service;

import com.ols.dto.request.ReviewUploadRequestDto;
import com.ols.dto.response.ReviewResponseDto;
import com.ols.entity.Course;
import com.ols.entity.Review;
import com.ols.entity.Student;
import com.ols.entity.Users;
import com.ols.repository.CourseRepository;
import com.ols.repository.ReviewRepository;
import com.ols.repository.StudentRepository;
import com.ols.repository.UsersRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final UsersRepository usersRepository;

    public Page<ReviewResponseDto> getReviews(Long courseId, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Review> reviews = reviewRepository.findAllByCourseId(courseId, pageable);

        return reviews.map(ReviewResponseDto::fromEntity);
    }

    public boolean save(Long userId, Long courseId, ReviewUploadRequestDto dto) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Optional<Course> _course = courseRepository.findById(courseId);
        Optional<Student> _student = studentRepository.findByUsers(user);

        if (_course.isPresent() && _student.isPresent()) {
            // 1. 기존에 작성한 리뷰가 있는지 확인
            Course course = _course.get();
            Student student = _student.get();
            Optional<Review> existingReview = reviewRepository.findByStudentAndCourse(student, course);

            if (existingReview.isPresent()) {
                return false;
            }

            // 리뷰 평점 계산(쿼리 성능 최적화
            Double currentRatingSum = course.getRating() * course.getReviews().size();
            long reviewCount = course.getReviews().size();

            Double newRatingSum = currentRatingSum + dto.getRating();
            Long newReviewCount = reviewCount + 1;

            course.setRating(newRatingSum / newReviewCount);
            course.setTotalRatingSum(newRatingSum);
            course.setReviewCount(newReviewCount);
            courseRepository.save(course);

            // 리뷰 저장
            reviewRepository.save(Review.builder()
                    .author(user.getUsername())
                    .title(dto.getTitle())
                    .content(dto.getContent())
                    .rating(dto.getRating())
                    .course(_course.get())
                    .student(_student.get())
                    .build());
            return true;
        }
        return false;
    }

    public boolean delete(Long userId, Long courseId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Student student = studentRepository.findByUsers(user)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));
        Review review = reviewRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        Double currentRating = review.getRating();
        Double newTotalRatingSum = course.getTotalRatingSum() - currentRating;
        Long newReviewCount = course.getReviewCount() - 1;

        // 0으로 나누는 오류 방지
        if (newReviewCount == 0) {
            course.setTotalRatingSum(0.0);
            course.setReviewCount(0L);
            course.setRating(0.0);
        } else {
            course.setTotalRatingSum(newTotalRatingSum);
            course.setReviewCount(newReviewCount);
            course.setRating(newTotalRatingSum / newReviewCount);
        }

        try {
            reviewRepository.delete(review);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}

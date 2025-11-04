package com.ols.service;

import com.ols.common.VideoStatus;
import com.ols.entity.Course;
import com.ols.entity.Video;
import com.ols.repository.CourseRepository;
import com.ols.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class VideoTransactionService {

    private final CourseRepository courseRepository;
    private final VideoRepository videoRepository;

    @Transactional // 트랜잭션 내에서 비디오 상태와 경로를 업데이트
    public void updateVideoStatusAndPaths(Long videoId, String hlsRelativePath, String thumbnailRelativePath, VideoStatus status) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found with ID: " + videoId));

        video.setVideoStatus(status); // **핵심: 비디오 상태 업데이트**

        if (hlsRelativePath != null) {
            video.setFilePath(hlsRelativePath); // HLS 매니페스트 경로 업데이트
        }
        if (thumbnailRelativePath != null) {
            video.setThumbnailPath(thumbnailRelativePath + "?v=" + System.currentTimeMillis()); // 썸네일 경로 업데이트
        }

        videoRepository.save(video); // DB에 변경 사항 저장 (UPDATE 쿼리 발생)
        System.out.println("비디오 ID " + videoId + " 상태 업데이트: " + status.name());
    }

    // Course 엔티티를 찾아오는 메서드 추가 (VideoService에서 사용)
    @Transactional(readOnly = true)
    public Course getCourseById(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));
    }

}
